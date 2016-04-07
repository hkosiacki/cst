import Statement from '../Statement';

export default class Directive extends Statement {
    constructor(childNodes) {
        super('Directive', childNodes);
    }

    _acceptChildren(children) {
        var value = children.passExpression();
        children.skipNonCode();
        children.skipSemicolon();
        children.assertEnd();
        this.value = value;
    }
}
