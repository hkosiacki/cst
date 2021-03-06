import Statement from '../Statement';

export default class ThrowStatement extends Statement {
    constructor(childNodes) {
        super('ThrowStatement', childNodes);
    }

    _acceptChildren(children) {
        children.passToken('Keyword', 'throw');
        children.skipSameLineNonCode();
        let argument = children.passExpression();
        children.skipNonCode();
        children.skipSemicolon();
        children.assertEnd();
        this.argument = argument;
    }
}
