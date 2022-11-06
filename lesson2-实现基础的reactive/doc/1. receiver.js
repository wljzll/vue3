/*********** 这种proxy的get写法当在get aliasName中再去取值this.name时不会触发proxy的get ***********/
// let person = {
//     name: 'jw',
//     get aliasName() {
//         return '**' + this.name + '**';
//     }
// }

// let proxy = new Proxy(person, {
//     get(target, key, receiver) {
//         console.log('xxxxxx');
//         return target[key];
//     },
//     set(target, key, value, receiver) {
//         target[key] = value;
//         return true;
//     }
// })

// console.log(proxy.aliasName);
// 不会触发proxy的get是因为 get aliasName中的this.name的this指的是person不是proxy
/*********** 这种proxy的get写法当在get aliasName中再去取值this.name时不会触发proxy的get ***********/


let person = {
    name: 'jw',
    get aliasName() {
        return '**' + this.name + '**';
    }
}

let proxy = new Proxy(person, {
    get(target, key, receiver) {
        console.log(key);
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    }
})

console.log(proxy.aliasName);