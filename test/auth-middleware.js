const expect = require('chai').expect;

const authMiddleware = require('../middleware/is-auth');

it('Should throw an error is auth header is not present', function() {
    const req = {
        get: function(headerName) {
            return null;
        }
    };
    expect(authMiddleware(req, {}, () => {})).to.throw();
})