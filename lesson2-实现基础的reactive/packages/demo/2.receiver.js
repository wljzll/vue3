// 解决监控不到的问题
let person = {
    name: 'jw',
    get aliasName() {
        return '**' + this.name + '**';
    }
}

let proxy = new Proxy(person, {
    get(target, key, receiver) {
        console.log(target, key, receiver);
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        Reflect.set(target, key, value, receiver);
        return true;
    }
})

// 这种代理方式，我们只监控到了 aliasName的取值 没有监控到alias里对this.name取值的劫持
console.log(proxy.aliasName); 