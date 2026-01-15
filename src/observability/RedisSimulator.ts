class RedisSimulator {
  private isDisabled: boolean = false;

  public isDown(): boolean {
    return this.isDisabled;
  }

  public toggle(): boolean {
    return (this.isDisabled = !this.isDisabled);
  }
}

const redisSimulator = new RedisSimulator();

export { redisSimulator };
