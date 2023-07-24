// 监控不到的问题
let person = {
    name: 'jw',
    get aliasName() {
        return '**' + this.name + '**';
    }
}

let proxy = new Proxy(person, {
    get(target, key, receiver) {
        console.log('取值', key);
        return target[key];
    },
    set(target, key, value, receiver) {
        target[key] = value;
        return true;
    }
})

// 这种代理方式，我们只监控到了 aliasName的取值 没有监控到alias里对this.name取值的劫持
console.log(proxy.aliasName); 