const expect = require('expect');

const utils = require('./utils');

describe('Utils', () => {

    describe('#add', () => {
        it('should add two numbers', () => {
            var res = utils.add(33, 11);
            expect(res).toBe(44).toBeA('number');
        });
        
        it('should async add two numbers', (done) => {
            utils.asyncAdd(4,3, (sum) => {
                expect(sum).toBe(7).toBeA('number');
                done();
            })
        });
    });

    describe('#square', () => {
        it('should square a number', () => {
            var res = utils.square(8);
            expect(res).toBe(64).toBeA('number');
        });
        
        it('should async square a number', (done) => {
            utils.asyncSquare(7, (square) => {
                expect(square).toBe(49).toBeA('number');
                done();
            });
        });
    })
    
});


// it('should expect some value', () => {
//     expect(12).toNotBe(11);
//     expect({name: 'Smith'}).toEqual({name: 'Smith'});
//     expect([1,2,3]).toInclud(1);
//     expect([1,2,3]).toExclude(5);

//     expect({
//         name: 'Bob',
//         age: 50,
//         location: 'OR'
//     }).toInclude({
//         age: 50
//     });
// }) ;

it('should set first name and last name', () => {
    var user = {
        age: 50
    }

    var res = utils.setName(user, 'John Smith');

    expect(res).toInclude({
        firstName: 'John',
        lastName: 'Smith'
    });
});