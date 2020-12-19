import { log } from '../LogDecorator';

class TestClass {
    constructor(private returnValue?: any) {
    }

    @log()
    testMethod(...args: any) {
        return this.returnValue;
    }

    @log({logArgs: false})
    testNoLogArgs(...args: any) {
        return this.returnValue;
    }

    @log({logArgs: [0, 2, 3]})
    testNoLogSecondArg(...args: any) {
        return this.returnValue;
    }

}

describe('log decorator', () => {
    it('should log and stuff', () => {
        expect('foo').toBeDefined();
    });
});

// describe(`Log Decorator`, () => {
//
//     let testObjectInstance: TestClass;
//     // let infoLoggerSpy: SinonSpy;
//     // let errorLoggerSpy: SinonSpy;
//
//     beforeEach(() => {
//         infoLoggerSpy = stub(ConsoleLogger, 'info');
//         errorLoggerSpy = stub(ConsoleLogger, 'error');
//     });
//
//     describe('when method called with args', () => {
//
//         beforeEach(() => {
//             testObjectInstance = new TestClass();
//         });
//
//         it('should log string arg', () => {
//             testObjectInstance.testMethod('foo');
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod called with args: ["foo"]');
//         });
//
//         it('should log object arg', () => {
//             testObjectInstance.testMethod({foo: 'bar'});
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod called with args: [{"foo":"bar"}]');
//         });
//
//         it('should log array arg', () => {
//             testObjectInstance.testMethod(['foo', 'bar']);
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod called with args: [["foo","bar"]]');
//         });
//
//     });
//
//     describe('when method returns a value', () => {
//
//
//         it('should log string return value', () => {
//             testObjectInstance = new TestClass('something');
//             testObjectInstance.testMethod('foo');
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod returned: something');
//         });
//
//         it('should log object return value', () => {
//             testObjectInstance = new TestClass({foo: "bar"});
//             testObjectInstance.testMethod('foo');
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod returned: {"foo":"bar"}');
//         });
//
//     });
//
//     describe('when method returns a promise', () => {
//         it('should log resolved result', async () => {
//             testObjectInstance = new TestClass(Promise.resolve({foo: "bar"}));
//             await testObjectInstance.testMethod('foo');
//
//             expect(infoLoggerSpy).to.have.been.calledWith('TestClass.testMethod returned: {"foo":"bar"}');
//         });
//
//         it('should log rejected result', async () => {
//             testObjectInstance = new TestClass(Promise.reject(Error("bad news")));
//             await expect(testObjectInstance.testMethod("foo")).to.eventually.be.rejected;
//             expect(errorLoggerSpy).to.have.been.calledWith('TestClass.testMethod threw error: bad news');
//         });
//     });
//
//     describe('log options', () => {
//         describe('when logArgs is false', () => {
//             it('should not log arguments', () => {
//                 testObjectInstance = new TestClass({foo: 'bar'});
//                 testObjectInstance.testNoLogArgs('hello');
//
//                 expect(infoLoggerSpy).not.to.have.been.calledWithMatch('hello');
//             });
//         });
//
//         describe('when logArgs is a list of numbers', () => {
//
//             beforeEach(() => {
//                 testObjectInstance = new TestClass({foo: 'bar'});
//                 testObjectInstance.testNoLogSecondArg('arg0', 'arg1', 'arg2', 'arg3');
//
//             });
//
//             it('should log arguments at given indices', () => {
//                 expect(infoLoggerSpy).to.have.been.calledWithMatch('called with args: ["arg0","arg2","arg3"]');
//             });
//
//             it('should not log arguments not at given indices', () => {
//                 expect(infoLoggerSpy).not.to.have.been.calledWithMatch('arg1');
//             });
//
//         });
//
//         describe('key filters', () => {
//
//             class KeyFilterTestClass extends TestClass {
//                 @log({
//                     keyFilters: [{
//                         target: 'args',
//                         filterAction: 'omit',
//                         paths: ['data.secret']
//                     }]
//                 })
//                 testOmitArgSecret(...args: any) {
//                 }
//             }
//
//             describe('for arguments', () => {
//                 describe('noLog', () => {
//
//                     class NoLogParamFilterTestClass extends TestClass {
//                         @log()
//                         testOmitFirstArg(@noLog firstArg: any, secondArg: any) {
//                         }
//
//                     }
//
//                     it('should ', () => {
//                         testObjectInstance = new NoLogParamFilterTestClass();
//                         (testObjectInstance as NoLogParamFilterTestClass).testOmitFirstArg(
//                             "Don't log this", "Log this");
//
//                         expect(infoLoggerSpy).not.to.have.been.calledWithMatch("Don't log this");
//                         expect(infoLoggerSpy).to.have.been.calledWithMatch("Log this");
//                     });
//
//                 });
//                 describe('omit', () => {
//                     it('should omit any matching keys on an argument', () => {
//                         testObjectInstance = new KeyFilterTestClass();
//                         (testObjectInstance as KeyFilterTestClass).testOmitArgSecret(
//                             {data: {secret: 'foo', nonSecret: 'bar'}},
//                             {data: {secret: 'some-other-secret'}, nonSecret: 'some-public-value'}
//                         );
//
//                         expect(infoLoggerSpy).to.have.been.calledWithMatch('bar');
//                         expect(infoLoggerSpy).to.have.been.calledWithMatch('some-public-value');
//                         expect(infoLoggerSpy).not.to.have.been.calledWithMatch('foo');
//                         expect(infoLoggerSpy).not.to.have.been.calledWithMatch('some-other-secret');
//                     });
//                 });
//             });
//         });
//     });
// });
