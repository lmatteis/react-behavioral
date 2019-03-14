export default [
  function* log() {
    while (true) {
      yield { wait: () => true };
      console.log(this.lastEvent());
    }
  }
];
