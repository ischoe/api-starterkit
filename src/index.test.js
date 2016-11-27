import test from 'tape';

const before = test;
const after = test;

const setup = () => {
  const fixtures = {};
  return fixtures;
};

const teardown = (fixtures) => {
  // Dispose of your fixtures here.
};

test('A simple test with fixtures', (assert) => {
  const fixture = setup();
  const expected = 'something to test';
  const actual = 'something to test';

  assert.equal(actual, expected,
    'Simple test works');
  teardown(fixture);

  assert.end();
});
