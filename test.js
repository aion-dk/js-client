async function test() {
    throw new Error('testing')
}

test()
    .then(() => {
        console.log('then')
    })
