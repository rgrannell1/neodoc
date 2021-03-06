-- | ARGV lexer
-- |
-- | > Given an argv array, i.e. `process.argv`, derive a stream of tokens
-- | > suitable for parsing against a docopt specification.
-- |
-- | ===

module Language.Docopt.ParserGen.Lexer (
  lex
  ) where

import Prelude
import Debug.Trace
import Data.List (List(..))
import Data.Either (Either(..))
import Data.Maybe (Maybe(..))
import Control.Apply ((*>), (<*))
import Data.String (fromCharArray)
import Data.List (List(..), foldM, many, singleton)
import qualified Text.Parsing.Parser             as P
import qualified Text.Parsing.Parser.Combinators as P
import qualified Text.Parsing.Parser.Pos         as P
import qualified Text.Parsing.Parser.String      as P
import qualified Data.Array as A
import Control.Plus (empty)
import Control.Bind ((=<<))
import Language.Docopt.ParserGen.Token
import Language.Docopt.Parser.Base
import qualified Language.Docopt.Errors as D
import qualified Language.Docopt.Value  as D

-- | Parse a single token from the ARGV stream.
-- | Because each item on the ARGV stream is a a string itself, apply a parser
-- | to each item and derive a token.
parseToken :: P.Parser String Token
parseToken = do
  P.choice $ P.try <$> [
    sopt <* P.eof
  , lopt <* P.eof
  , eoa  <* P.eof
  , lit  <* P.eof
  ]

  where
    eoa :: P.Parser String Token
    eoa = do
      P.string "--"
      return $ EOA empty

    -- | Parse a short option
    sopt :: P.Parser String Token
    sopt = do
      P.char '-'
      x  <- alphaNum
      xs <- A.many $ P.noneOf [ ' ', '='  ]
      P.optional do many space *> P.char '=' <* many space
      arg <- P.choice $ P.try <$> [
        return <$> fromCharArray <$> do A.some P.anyChar
      , return Nothing
      ]
      many space
      return $ SOpt x xs arg

    -- | Parse a long option
    lopt :: P.Parser String Token
    lopt = do
      P.string "--"
      xs <- fromCharArray <$> do
        A.some $ P.noneOf [ ' ', '='  ]
      arg <- P.choice $ P.try <$> [
        Just <$> do
          many space *> P.char '=' <* many space
          fromCharArray <$> do A.many P.anyChar
      , pure Nothing
      ]
      many space
      pure $ LOpt xs arg

    -- | Parse a literal
    lit :: P.Parser String Token
    lit = Lit <<< fromCharArray <$> do
      A.many P.anyChar

-- | Reduce the array of arguments (argv) to a list of tokens, by parsing each
-- | item individually.
lex :: (List String) -> Either P.ParseError (List PositionedToken)
lex xs = go xs 1
  where
    go Nil _ = return Nil
    go (Cons x xs) n = do
      tok <- P.runParser x parseToken
      case tok of
        (EOA _) -> do
          return $ singleton $ PositionedToken {
            token:     EOA (D.StringValue <$> xs)
          , sourcePos: P.Position { line: 1, column: n }
          , source:    x
          }
        _ -> do
          toks <- go xs (n + 1)
          return
            $ singleton (PositionedToken {
                          token:     tok
                        , sourcePos: P.Position { line: 1, column: n }
                        , source:    x
                        }) ++ toks
