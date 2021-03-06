import {parseAndGetStatement} from '../../../utils';
import {expect} from 'chai';

describe('ThrowStatement', () => {
    it('should return correct type', () => {
        expect(parseAndGetStatement('throw 1;').type).to.equal('ThrowStatement');
    });

    it('should accept argument', () => {
        let statement = parseAndGetStatement('throw 1 ;');
        expect(statement.type).to.equal('ThrowStatement');
        expect(statement.argument.type).to.equal('NumericLiteral');
        expect(statement.argument.value).to.equal(1);
    });

    it('should accept argument in parentheses', () => {
        let statement = parseAndGetStatement('throw (1) ;');
        expect(statement.type).to.equal('ThrowStatement');
        expect(statement.argument.type).to.equal('NumericLiteral');
        expect(statement.argument.value).to.equal(1);
    });

    it('should work without semicolon', () => {
        let statement = parseAndGetStatement('throw 1');
        expect(statement.type).to.equal('ThrowStatement');
        expect(statement.argument.type).to.equal('NumericLiteral');
        expect(statement.argument.value).to.equal(1);
    });
});
