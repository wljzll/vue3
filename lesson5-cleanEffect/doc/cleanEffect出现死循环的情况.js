let s = new Set('a');

s.forEach(item => {
    s.delete(item);
    s.add(item);
});

/**
 * s循环删除item 然后有加回去了 又会再去循环 形成了死循环
 */