import faker from 'faker';
import { createDecorator } from '../LogDecorator'


describe(`Log Decorator`, () => {
    let consoleLoggerSpy: jest.Mock<any, any> = jest.fn()

    const log = createDecorator({loggers: { info: consoleLoggerSpy }})
    class TestClass {
        constructor(private returnValue?: any) {
        }

        @log()
        testMethod(...args: any) {
            return this.returnValue
        }
        //
        // @log({logArgs: false})
        // testNoLogArgs(...args: any) {
        //     return this.returnValue
        // }
        //
        // @log({logArgs: [0, 2, 3]})
        // testNoLogSecondArg(...args: any) {
        //     return this.returnValue
        // }

    }
    let testObjectInstance: TestClass

    describe('when method called with args', () => {

        beforeEach(() => {
            testObjectInstance = new TestClass()
        })

        it('should log string arg', () => {
            const arg = faker.random.words(5)
            testObjectInstance.testMethod(arg)

            expect(consoleLoggerSpy).toHaveBeenCalledWith(`TestClass.testMethod called with args: ["${arg}"]`)
        })

        it('should log object arg', () => {
            const arg = faker.random.words(5)
            testObjectInstance.testMethod({foo: arg})

            expect(consoleLoggerSpy).toHaveBeenCalledWith(`TestClass.testMethod called with args: [{"foo": "${arg}"}]`)
        })

        it('should log array arg', () => {
            testObjectInstance.testMethod(['foo', 'bar'])

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod called with args: [["foo","bar"]]')
        })
    })

    describe('when method returns a value', () => {

        it('should log string return value', () => {
            testObjectInstance = new TestClass('something')
            testObjectInstance.testMethod('foo')

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod returned: something')
        })

        it('should log object return value', () => {
            testObjectInstance = new TestClass({foo: "bar"})
            testObjectInstance.testMethod('foo')

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod returned: {"foo":"bar"}')
        })

    })

    // describe('when method returns a promise', () => {
    //     it('should log resolved result', async () => {
    //         testObjectInstance = new TestClass(Promise.resolve({foo: "bar"}))
    //         await testObjectInstance.testMethod('foo')
    //
    //         expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod returned: {"foo":"bar"}')
    //     })
    //
    //     it('should log rejected result', async () => {
    //         testObjectInstance = new TestClass(Promise.reject(Error("bad news")))
    //         await expect(testObjectInstance.testMethod("foo")).to.eventually.be.rejected
    //         expect(errorLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod threw error: bad news')
    //     })
    // })
    //
    // describe('log options', () => {
    //     describe('when logArgs is false', () => {
    //         it('should not log arguments', () => {
    //             testObjectInstance = new TestClass({foo: 'bar'})
    //             testObjectInstance.testNoLogArgs('hello')
    //
    //             expect(consoleLoggerSpy).not.toHaveBeenCalledWithMatch('hello')
    //         })
    //     })
    //
    //     describe('when logArgs is a list of numbers', () => {
    //
    //         beforeEach(() => {
    //             testObjectInstance = new TestClass({foo: 'bar'})
    //             testObjectInstance.testNoLogSecondArg('arg0', 'arg1', 'arg2', 'arg3')
    //
    //         })
    //
    //         it('should log arguments at given indices', () => {
    //             expect(consoleLoggerSpy).toHaveBeenCalledWithMatch('called with args: ["arg0","arg2","arg3"]')
    //         })
    //
    //         it('should not log arguments not at given indices', () => {
    //             expect(consoleLoggerSpy).not.toHaveBeenCalledWithMatch('arg1')
    //         })
    //
    //     })
    //
    //     describe('key filters', () => {
    //
    //         class KeyFilterTestClass extends TestClass {
    //             @log({
    //                 keyFilters: [{
    //                     target: 'args',
    //                     filterAction: 'omit',
    //                     paths: ['data.secret']
    //                 }]
    //             })
    //             testOmitArgSecret(...args: any) {
    //             }
    //         }
    //
    //         describe('for arguments', () => {
    //             describe('noLog', () => {
    //
    //                 class NoLogParamFilterTestClass extends TestClass {
    //                     @log()
    //                     testOmitFirstArg(@noLog firstArg: any, secondArg: any) {
    //                     }
    //
    //                 }
    //
    //                 it('should ', () => {
    //                     testObjectInstance = new NoLogParamFilterTestClass()
    //                     (testObjectInstance as NoLogParamFilterTestClass).testOmitFirstArg(
    //                         "Don't log this", "Log this")
    //
    //                     expect(consoleLoggerSpy).not.toHaveBeenCalledWithMatch("Don't log this")
    //                     expect(consoleLoggerSpy).toHaveBeenCalledWithMatch("Log this")
    //                 })
    //
    //             })
    //             describe('omit', () => {
    //                 it('should omit any matching keys on an argument', () => {
    //                     testObjectInstance = new KeyFilterTestClass()
    //                     (testObjectInstance as KeyFilterTestClass).testOmitArgSecret(
    //                         {data: {secret: 'foo', nonSecret: 'bar'}},
    //                         {data: {secret: 'some-other-secret'}, nonSecret: 'some-public-value'}
    //                     )
    //
    //                     expect(consoleLoggerSpy).toHaveBeenCalledWithMatch('bar')
    //                     expect(consoleLoggerSpy).toHaveBeenCalledWithMatch('some-public-value')
    //                     expect(consoleLoggerSpy).not.toHaveBeenCalledWithMatch('foo')
    //                     expect(consoleLoggerSpy).not.toHaveBeenCalledWithMatch('some-other-secret')
    //                 })
    //             })
    //         })
    //     })
})
