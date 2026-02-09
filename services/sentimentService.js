const aposToLexForm = require('apos-to-lex-form');
const natural = require('natural');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');

const analyze = (phrase) => {


  if (!phrase) {
    return;
  }
  const spellCorrector = new SpellCorrector();

  // negation handling
  // convert apostrophe=connecting words to lex form 
  const lexedReview = aposToLexForm(phrase);

  // casing
  const casedReview = lexedReview.toLowerCase();

  // removing
  const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

  // tokenize review
  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

  // spell correction
  tokenizedReview.forEach((word, index) => {
    tokenizedReview[index] = spellCorrector.correct(word);
  })

  // remove stopwords
  const filteredReview = SW.removeStopwords(tokenizedReview);

  const { SentimentAnalyzer, PorterStemmer } = natural;
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');

  const analysis = analyzer.getSentiment(filteredReview);

  console.log(analysis);

  return analysis

}

module.exports = {
    analyze
}