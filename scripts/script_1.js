module.exports = async function main(callback) {
    try {
        // write some code
        callback()
    } catch (error) {
        console.log(error);
    }
}