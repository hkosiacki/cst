import {parseAndGetProgram} from '../../utils';
import Token from '../../../src/elements/Token';
import {expect} from 'chai';

describe('Element', () => {
    describe('Traversing', () => {
        let program;
        let secondVar;

        beforeEach(() => {
            program = parseAndGetProgram('var\nfirst = 1; var second = 2;');
            secondVar = program.selectTokensByType('Keyword')[1];
        });

        it('should get previous token', () => {
            expect(secondVar.getPreviousToken().getPreviousToken().getSourceCode()).to.equal(';');
        });
    });

    describe('Element#removeChild', () => {
        it('should remove child', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');

            program.removeChild(program.firstChild);

            expect(program.getSourceCode()).to.equal(' var second = 2;');
        });

        it('should return removed child', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');
            let child = program.firstChild;

            expect(program.removeChild(program.firstChild)).to.equal(child);
        });

        it('should remove child through parent', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');

            program.firstChild.parentElement.removeChild(program.firstChild);

            expect(program.getSourceCode()).to.equal(' var second = 2;');
        });

        it('should remove whitespace child', () => {
            let program = parseAndGetProgram('\n\n\nvar first = 1; var second = 2;');

            program.removeChild(program.firstChild);

            expect(program.getSourceCode()).to.equal('var first = 1; var second = 2;');
        });

        it('should remove child through sibling', () => {
            let program = parseAndGetProgram('\n\n\nvar first = 1; var second = 2;');

            program.removeChild(program.firstChild.nextSibling);

            expect(program.getSourceCode()).to.equal('\n\n\n var second = 2;');
        });

        it('should remove whitespace child through parent element', () => {
            let program = parseAndGetProgram('\n\n\nvar first = 1; var second = 2;');

            program.firstChild.parentElement.removeChild(program.firstChild);

            expect(program.getSourceCode()).to.equal('var first = 1; var second = 2;');
        });

        it('should remove element references', () => {
            let program = parseAndGetProgram('var first = 1;');
            let firstVar = program.selectNodesByType('VariableDeclaration')[0];

            program.removeChild(firstVar);

            expect(firstVar.parentElement).to.not.equal(program);

            expect(program.childElements.length).to.equal(1);
            expect(program.childElements[0].type).to.equal('EOF');
        });
    });

    describe('Element#remove', () => {
        it('should remove element', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');

            program.firstChild.remove();

            expect(program.getSourceCode()).to.equal(' var second = 2;');
        });

        it('should be a noop for parentless element', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');

            expect(() => {
                program.remove();
                program.remove();
            }).to.not.throw();
        });

        it('should remove semi-colon', () => {
            let program = parseAndGetProgram('d();');

            program.getLastToken().getPreviousToken().remove();

            expect(program.getSourceCode()).to.equal('d()');
        });
    });

    describe('Element#replaceChild', () => {
        it('should replace child', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');
            let firstVar = program.selectNodesByType('VariableDeclaration')[0];

            program.replaceChild(new Token('Whitespace', ';'), firstVar);

            expect(program.getSourceCode()).to.equal('; var second = 2;');
        });

        it('should replace ObjectProperty', () => {
            let program = parseAndGetProgram('({ test: 1 })');
            let iden = program.selectTokensByType('Identifier')[0];

            iden.parentElement.replaceChild(new Token('Identifier', '"t"'), iden);

            expect(program.getSourceCode()).to.equal('({ "t": 1 })');
        });

        it('should replace child with existing one', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');
            let firstVar = program.selectNodesByType('VariableDeclaration')[0];
            let secondVar = program.selectNodesByType('VariableDeclaration')[1];

            program.removeChild(firstVar);
            program.replaceChild(firstVar, secondVar);

            expect(program.getSourceCode()).to.equal(' var first = 1;');
        });
    });

    describe('range property', () => {
        it('should return range property for VariableDeclarator', () => {
            let program = parseAndGetProgram('var answer = 1;');
            let node = program.selectNodesByType('VariableDeclarator')[0];

            expect(node.getRange()).to.include(4, 10);
        });

        it('should return range property for VariableDeclaration', () => {
            let program = parseAndGetProgram('var answer = 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getRange()).to.include(0, 15);
        });

        it('should return range property for second VariableDeclarators', () => {
            let program = parseAndGetProgram('var first = 1; var second = 2;');
            let node = program.selectNodesByType('VariableDeclarator')[1];

            expect(node.getRange()).to.include(19, 29);
        });
    });

    describe('loc property', () => {
        it('should return loc property for oneliner', () => {
            let program = parseAndGetProgram('var answer = 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 1,
                    'column': 0,
                },
                'end': {
                    'line': 1,
                    'column': 15,
                },
            });
        });

        it('should return loc property for oneliner first node with additional space', () => {
            let program = parseAndGetProgram(' var answer = 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 1,
                    'column': 1,
                },
                'end': {
                    'line': 1,
                    'column': 16,
                },
            });
        });

        it('should return loc property for oneliner first node with space and newline', () => {
            let program = parseAndGetProgram('\n var answer = 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 2,
                    'column': 1,
                },
                'end': {
                    'line': 2,
                    'column': 16,
                },
            });
        });

        it('should return loc property for multiple line breaks', () => {
            let program = parseAndGetProgram('\n\n\nvar answer = 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 4,
                    'column': 0,
                },
                'end': {
                    'line': 4,
                    'column': 15,
                },
            });
        });

        it('should return loc property with tricky end', () => {
            let program = parseAndGetProgram('\n\n\n var answer = \n1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 4,
                    'column': 1,
                },
                'end': {
                    'line': 5,
                    'column': 2,
                },
            });
        });

        it('should return loc property with space tricky end', () => {
            let program = parseAndGetProgram('\n\n\n var answer = \n 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 4,
                    'column': 1,
                },
                'end': {
                    'line': 5,
                    'column': 3,
                },
            });
        });

        it('should return loc property with spaces tricky end', () => {
            let program = parseAndGetProgram('var answer = \n\n\n  1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 1,
                    'column': 0,
                },
                'end': {
                    'line': 4,
                    'column': 4,
                },
            });
        });

        it('should return loc property with spaces & symbol tricky end', () => {
            let program = parseAndGetProgram('var answer = \n\n2\n 1;');
            let node = program.selectNodesByType('VariableDeclaration')[0];

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 1,
                    'column': 0,
                },
                'end': {
                    'line': 3,
                    'column': 1,
                },
            });
        });

        it('should return loc property for apple pragmas', () => {
            let program = parseAndGetProgram('#!/usr/bin/env node', {
                languageExtensions: {
                    appleInstrumentationDirectives: true,
                },
            });
            let node = program.getFirstToken();

            expect(node.getLoc()).to.deep.equal({
                'start': {
                    'line': 1,
                    'column': 0,
                },
                'end': {
                    'line': 1,
                    'column': 19,
                },
            });
        });
    });
});
