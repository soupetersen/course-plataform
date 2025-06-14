type Constructor<T = {}> = new (...args: any[]) => T;
type Factory<T> = () => T;
type Dependency<T> = Constructor<T> | Factory<T> | T;

export class DIContainer {
  private dependencies = new Map<string, any>();
  private singletons = new Map<string, any>();

  register<T>(name: string, dependency: Dependency<T>, singleton: boolean = false): void {
    this.dependencies.set(name, { dependency, singleton });
  }

  resolve<T>(name: string): T {
    const registration = this.dependencies.get(name);
    
    if (!registration) {
      throw new Error(`Dependency '${name}' not found`);
    }

    const { dependency, singleton } = registration;

    if (singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    let instance: T;

    if (typeof dependency === 'function') {
      if (this.isConstructor(dependency)) {
        instance = new dependency() as T;
      } else {
        instance = (dependency as Factory<T>)();
      }
    } else {
      instance = dependency as T;
    }

    if (singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  registerSingleton<T>(name: string, dependency: Dependency<T>): void {
    this.register(name, dependency, true);
  }

  has(name: string): boolean {
    return this.dependencies.has(name);
  }

  clear(): void {
    this.dependencies.clear();
    this.singletons.clear();
  }

  private isConstructor(func: any): boolean {
    try {
      const test = new func();
      return true;
    } catch (error) {
      return false;
    }
  }

  resolveWithDependencies<T>(name: string, dependencies: string[] = []): T {
    const resolvedDeps = dependencies.map(dep => this.resolve(dep));
    const registration = this.dependencies.get(name);
    
    if (!registration) {
      throw new Error(`Dependency '${name}' not found`);
    }

    const { dependency } = registration;
    
    if (typeof dependency === 'function' && this.isConstructor(dependency)) {
      return new dependency(...resolvedDeps) as T;
    }
    
    throw new Error(`Cannot resolve '${name}' with dependencies - not a constructor`);
  }
}
