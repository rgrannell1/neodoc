-- | Resolve ambiguities by combining the parsed usage section with any parsed
-- | Option sections, as well as some best effort guessing.
-- |
-- | ===

module Docopt.Spec.Solver where

import Prelude
import Debug.Trace
import Data.Either (Either(..))
import Data.Maybe (Maybe(..), isJust, maybe, maybe')
import Data.List (List(..), filter, head, foldM, concat, (:), singleton
                , catMaybes)
import Data.Traversable (traverse)
import Data.Foldable (foldl)
import Control.Plus (empty)
import Data.Monoid (mempty)

import Docopt (Argument(..), Application(..), Branch(..), OptionArgument(..)
              , Value(..))
import qualified Docopt.Spec.Parser.Desc  as D
import qualified Docopt.Spec.Parser.Usage as U

data SolveError = SolveError
instance showSolveError :: Show SolveError where
  show _ = "SolveError"

findOptionDesc :: List D.Desc -> U.Argument -> Maybe D.Desc
findOptionDesc ds (U.Option n _ _) = head $ filter matches ds
  where
    matches (D.OptionDesc (D.Option { name=(D.Long n')   })) = n == n'
    matches (D.OptionDesc (D.Option { name=(D.Full _ n') })) = n == n'
    matches _ = false
findOptionDesc ds (U.OptionStack n _ _ _) = head $ filter matches ds
  where
    matches _ = false
findOptionDesc _ _ = Nothing

solveArg :: U.Argument -> List D.Desc -> Either SolveError (List Argument)
solveArg (U.Command s) _       = singleton <$> return (Command s)
solveArg (U.Positional s r) _  = singleton <$> return (Positional s r)
solveArg o@(U.Option n a r) ds = singleton <$> do
  -- XXX: Is `head` the right thing to do here? What if there are more
  -- matches? That would indicate ambigiutiy and needs to be treated, possibly
  -- with an error?
  return $ maybe' (\_ -> Option Nothing (Just n) (toArg a) r)
                  id
                  (head $ catMaybes $ convert <$> ds)

  where
    toArg a = a >>= \an -> return $ OptionArgument an Nothing
    resolveArg (Just an) Nothing
      = return $ OptionArgument an Nothing
    resolveArg Nothing (Just (D.Argument a))
      -- XXX: The conversion to `StringValue` should not be needed,
      -- `Desc.Argument` should be of type `Maybe Value`.
      = return $ OptionArgument a.name (StringValue <$> a.default)
    resolveArg (Just an) (Just (D.Argument a))
      -- XXX: Do we need to guard that `an == a.name` here?
      -- XXX: The conversion to `StringValue` should not be needed,
      -- `Desc.Argument` should be of type `Maybe Value`.
      = return $ OptionArgument a.name (StringValue <$> a.default)

    resolveArg _ _ = Nothing
    convert (D.OptionDesc (D.Option { name=(D.Long n'), arg=a' }))
      = return $ Option Nothing (Just n) (resolveArg a a') r
    convert (D.OptionDesc (D.Option { name=(D.Full f n'), arg=a' }))
      = return $ Option (Just f) (Just n) (resolveArg a a') r

    convert _ = Nothing

solveArg o@(U.OptionStack f fs a r) ds = do
  -- TODO
  -- Match f and then each f in fs up with a descrption, if any, returning
  -- an Docopt.Option for each.
  Left SolveError
solveArg (U.Group o bs r) ds  = singleton <$> do
  flip (Group o) r <$> do
    foldM go empty bs
      where go :: List Branch -> U.Branch -> Either SolveError (List Branch)
            go a b = do
              br <- solveBranch b ds
              return (br:a)

solveBranch :: U.Branch -> List D.Desc -> Either SolveError Branch
solveBranch as ds = Branch <<< concat <$> (foldM step Nil as)
  where
    step :: List (List Argument)
          -> U.Argument
          -> Either SolveError (List (List Argument))
    step ass a = do
      xs <- solveArg a ds
      return $ ass ++ (singleton xs)

solveUsage :: U.Usage -> List D.Desc -> Either SolveError Application
solveUsage (U.Usage _ bs) ds = Application <$> (foldM step Nil bs)
  where
    step :: List Branch -> U.Branch -> Either SolveError (List Branch)
    step bs b = do
      x <- solveBranch b ds
      return $ bs ++ (singleton x)

solve :: (List U.Usage)
      -> (List D.Desc)
      -> Either SolveError (List Application)
solve us ds = foldM step Nil us
  where
    step :: List Application -> U.Usage -> Either SolveError (List Application)
    step as u = do
      x <- solveUsage u ds
      return $ as ++ (singleton x)
