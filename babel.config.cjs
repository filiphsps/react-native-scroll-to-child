module.exports = {
    presets: ['@react-native/babel-preset'],
    plugins: ['@babel/plugin-transform-flow-strip-types', ['@babel/plugin-transform-private-methods', { loose: true }]]
};
