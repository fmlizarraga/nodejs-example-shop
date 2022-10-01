const suma = (a, b) => {
    if (a && b) {
        return a+b;
    }
    throw new Error('Invalid Arguments');
};

try {
    console.log(suma(1));
} catch (error) {
    console.log('Ha ocurrido un error!');
    console.log(error);
}

console.log('Continua la ejecucion');