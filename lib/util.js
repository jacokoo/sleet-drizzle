"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IdGenerator {
    constructor() {
        this.id = 0;
    }
    next() {
        const a = Math.floor(this.id / 51);
        const b = this.id - a * 51;
        if (a < 26)
            ;
    }
}
exports.IdGenerator = IdGenerator;
