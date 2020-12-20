import faker from 'faker';
import { createDecorator } from '../LogDecorator'
import { logExclude, logOmitPaths } from '../LoggingFilters';


describe(`Log Decorator`, () => {
    let consoleLoggerSpy: jest.Mock<any, any> = jest.fn()
    let errorLoggerSpy: jest.Mock<any, any> = jest.fn()

    const log = createDecorator({loggers: {info: consoleLoggerSpy, error: errorLoggerSpy}})

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

    let testObjectInstance: any;

    beforeEach(() => {
        consoleLoggerSpy.mockReset()
        errorLoggerSpy.mockReset()
    });

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

            expect(consoleLoggerSpy).toHaveBeenCalledWith(`TestClass.testMethod called with args: [{"foo":"${arg}"}]`)
        })

        it('should log array arg', () => {
            testObjectInstance.testMethod(['foo', 'bar'])

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod called with args: [["foo","bar"]]')
        })
    })

    describe('when method returns a value', () => {

        it('should log string return value', () => {
            const expectedReturnValue = faker.random.words(5)
            testObjectInstance = new TestClass(expectedReturnValue)
            testObjectInstance.testMethod('foo')

            expect(consoleLoggerSpy).toHaveBeenCalledWith(`TestClass.testMethod returned: ${expectedReturnValue}`)
        })

        it('should log object return value', () => {
            testObjectInstance = new TestClass({foo: "bar"})
            testObjectInstance.testMethod('foo')

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod returned: {"foo":"bar"}')
        })

    })

    describe('when method returns a promise', () => {
        it('should log resolved result', async () => {
            testObjectInstance = new TestClass(Promise.resolve({foo: "bar"}))
            await testObjectInstance.testMethod('foo')

            expect(consoleLoggerSpy).toHaveBeenCalledWith('TestClass.testMethod returned: {"foo":"bar"}')
        })

        it('should log rejected result', async () => {
            const someError = faker.random.words(4)
            testObjectInstance = new TestClass(Promise.reject(Error(someError)))
            await expect(testObjectInstance.testMethod("foo")).rejects.toThrow()
                .then(() =>
                    expect(errorLoggerSpy).toHaveBeenCalledWith(`TestClass.testMethod threw error: ${someError}`)
                )
        })
    })
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
    describe('key filters', () => {

        class KeyFilterTestClass extends TestClass {
            @log({
                keyFilters: [{
                    target: 'args',
                    filterAction: 'omit',
                    paths: ['data.secret']
                }]
            })
            testOmitArgSecret(...args: any) {
            }
        }

        describe('for arguments', () => {
            describe('logExclude', () => {

                class NoLogParamFilterTestClass extends TestClass {
                    @log()
                    testOmitFirstArg(@logExclude firstArg: any, secondArg: any) {
                    }

                }

                beforeEach(() => {
                    new NoLogParamFilterTestClass()
                        .testOmitFirstArg("Don't log this", "Log this")
                });

                describe('when param is marked with logExclude annotation', () => {
                    it('should not get logged', () => {
                        expect(consoleLoggerSpy).not.toHaveBeenCalledWith(expect.stringMatching("Don't log this"))
                        expect(consoleLoggerSpy).toHaveBeenCalledWith(expect.stringMatching("Log this"))
                    })
                });

                describe('when param is not marked with logExclude annotation', () => {
                    it('should get logged', () => {
                        expect(consoleLoggerSpy).toHaveBeenCalledWith(expect.stringMatching("Log this"))
                    })
                });

            })

            describe('logOmitPaths', () => {
                class LogOmitPathsTestClass extends TestClass {
                    @log()
                    testOmitPathsFromFirstArg(@logOmitPaths([ 'someKey.lowSecret']) firstArg: any, secondArg: any) {
                    }

                }

                let forbiddenKey: string;

                beforeEach(() => {
                    forbiddenKey = faker.random.word();
                    const arg = {
                        // topSecret: `${forbiddenKey}-top-secret`,
                        someKey: {
                            lowSecret: `${forbiddenKey}-low-secret`,
                            allowableValue: 'allowed-bar'
                        },
                        allowableValue: 'allowed-foo'
                    }
                    new LogOmitPathsTestClass()
                        .testOmitPathsFromFirstArg(arg, "Log this")
                });

                    it('should not log any forbidden paths', () => {
                        expect(consoleLoggerSpy).not.toHaveBeenCalledWith(expect.stringMatching(forbiddenKey))
                    })

                describe('when param is not marked with logExclude annotation', () => {
                    it('should get logged', () => {
                        expect(consoleLoggerSpy).toHaveBeenCalledWith(expect.stringMatching("Log this"))
                    })
                });

            })

            describe('omit key filter', () => {
                beforeEach(() => {

                })
                it('should omit any matching keys on an argument', () => {
                    testObjectInstance = new KeyFilterTestClass();
                    (testObjectInstance as KeyFilterTestClass).testOmitArgSecret(
                        {data: {secret: 'foo', nonSecret: 'bar'}},
                        {data: {secret: 'some-other-secret'}, nonSecret: 'some-public-value'}
                    )

                    expect(consoleLoggerSpy).toHaveBeenCalledWith(expect.stringMatching('bar'))
                    expect(consoleLoggerSpy).toHaveBeenCalledWith(expect.stringMatching('some-public-value'))
                    expect(consoleLoggerSpy).not.toHaveBeenCalledWith(expect.stringMatching('foo'))
                    expect(consoleLoggerSpy).not.toHaveBeenCalledWith(expect.stringMatching('some-other-secret'))
                })
            })
        })
    })
})
