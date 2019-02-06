import { Frame } from '../src/Frame';
import { expect } from 'chai';
import 'mocha';

// New class design (Frame is an abstract class) renders these tests useless!
describe("Frame", () => {
    describe("when extend Frame class", () => {
        class Stub extends Frame {
            public validateThrows(): boolean {
                throw new Error("Method not implemented.");
            }
            protected canScore(): boolean {
                throw new Error("Method not implemented.");
            }
            protected setScore(): Frame {
                throw new Error("Method not implemented.");
            }
        }

        it("should exist", () => {
            expect(Stub).to.exist;
        });
        it("#validateThrows method exists", () => {
            const s = new Stub();
            expect(s.validateThrows).to.throw(/Method not implemented/);
        });
    });
});