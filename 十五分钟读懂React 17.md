# 十五分钟读懂React 17 

 作为时下最火的前端框架之一，React每次发版都会带来创新的改变，如React最早提出虚拟DOM、React 16引入fiber架构，再到后来React 16.8提出令人耳目一新的Hooks，这些创新也是很多人推崇React的一个重要原因。然而，到了React 17，rc发布日志上竟然说这次版本最大的特点就是**无新特性**，从目前来说，这个日志是让很多人失望了。

 这么多人对这次发版失望，那React 17就真的没什么好说的吗？显然不是，至少我认为不是的，从长远来看，无论是项目角度，还是源码学习角度，作为一个资深reactress，我还是有很多东西要学习的。

 首先面对用户的更改，React官网上说的很详细了。如果你是一个React开发者，并且不想永远停留在老版本，想深入了解React 17，想知道新版本对你开发的影响，那接下来我们来聊聊应该从哪些角度。

## 一、全新的 JSX 转换

 React 17以前，React中如果使用JSX，则必须像下面这样导入React，否则会报错，这是因为**旧的 JSX 转换**会把 JSX 转换为 `React.createElement(...)` 调用。

```jsx
import React from 'react';

export default function App(props) {
  return <div>app </div>;
}
```

![image-20201110172720403](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a98398065494902956f3a1ef600a6ee~tplv-k3u1fbpfcp-watermark.awebp)

 当然，这并不完美，除了增加了学习成本，还有无法做到的[性能优化和简化](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Freactjs%2Frfcs%2Fblob%2Fcreatelement-rfc%2Ftext%2F0000-create-element-changes.md%23motivation)， 如createElement里还要动态做children的拼接、依赖于React的导入等等。

 而React 17带来了改变，可以让我们单独使用 JSX 而无需引入 React。这是因为新的 JSX 转换**不会将 JSX 转换为 React.createElement**，而是自动从 React 的 package 中引入新的入口函数并调用。另外此次升级不会改变 JSX 语法，旧的 JSX 转换也将继续工作。

## 二、事件委托的变更

 在 React 16 或更早版本中，React 会由于事件委托对大多数事件执行 `document.addEventListener()`。但是一旦你想要局部使用React，那么React中的事件会影响全局，如下面这个例子，当把React和jQuery一起使用，那么当点击input的时候，document上和React不相关的事件也会被触发，这符合React的预期，但是并不符合用户的预期。

 ![image-20201110151901137](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c339f24dedb4be5855739e85175ee95~tplv-k3u1fbpfcp-watermark.awebp)

 令人开心的是，这次的React 17就解决了这个问题~，这次React 不再将事件添加在`document` 上，而是添加到渲染 React 树的根 DOM 容器中：

```jsx
const rootNode = document.getElementById('root');
ReactDOM.render(<App />, rootNode);
复制代码
```

 这种改变不仅方便了局部使用React的项目，还可以用于项目的逐步升级，如一部分使用React 18，另一部分使用React 19，事件是分开的，这样也就不会相互影响。当然这并不是鼓励大家在一个项目中使用多个React版本，而只是作为一种临时处理的过渡~

 好了，如果你只是励志做个普通工程师，可以跳到下个小章节看了，如果是Reactress，继续往下看：

 下图形象描述了这次的变更，图片来自React官网[react.docschina.org/blog/2020/1…](https://link.juejin.cn/?target=https%3A%2F%2Freact.docschina.org%2Fblog%2F2020%2F10%2F20%2Freact-v17.html)

![此图展示了 React 17 如何将事件连接到根节点而非 document](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1578b41a1a184b808b1607a174b1b6f1~tplv-k3u1fbpfcp-watermark.awebp)

 自从其发布以来，React 一直自动进行事件委托。当触发 DOM 事件时，React 会找出调用的组件，然后 React 事件会在组件中向上 “冒泡”。这被称为[事件委托](https://link.juejin.cn/?target=https%3A%2F%2Fdavidwalsh.name%2Fevent-delegate)。除了在大型应用程序上具有性能优势外，它还使添加类似于 [replaying events](https://link.juejin.cn/?target=https%3A%2F%2Ftwitter.com%2Fdan_abramov%2Fstatus%2F1200118229697486849) 这样的新特性变得更加容易。

 事件委托，也就是我们通常提到的事件代理机制，这种机制不会把时间处理函数直接绑定在真实的节点上，而是把所有的事件绑定到结构的最外层，使用一个统一的事件监听和处理函数。当组件挂载或卸载时，只是在这个统一的事件监听器上插入或删除一些对象；当事件发生时，首先被这个统一的事件监听器处理，然后在映射表里找到真正的事件处理函数并调用。这样做简化了事件处理和回收机制，效率也有很大提升。



## 三、事件系统相关更改

 除了事件委托这种比较大的更改，事件系统上还发生了一些小的更改，

 与以往不同，React 17中`onScroll` 事件不再冒泡，以防止[出现常见的混淆](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Fissues%2F15723)。

 React 的 `onFocus` 和 `onBlur` 事件已在底层切换为原生的 `focusin` 和 `focusout` 事件。它们更接近 React 现有行为，有时还会提供额外的信息。

 捕获事件（例如，`onClickCapture`）现在使用的是实际浏览器中的捕获监听器。

这些更改会使 React 与浏览器行为更接近，并提高了互操作性。

> 注意：
>
> 尽管 React 17 **底层**已将 `onFocus` 事件从 `focus` 切换为 `focusin`，但请注意，这并未影响冒泡行为。在 React 中，`onFocus` 事件总是冒泡的，在 React 17 中会继续保持，因为通常它是一个更有用的默认值。请参阅 [sandbox](https://link.juejin.cn/?target=https%3A%2F%2Fcodesandbox.io%2Fs%2Fstrange-albattani-7tqr7%3Ffile%3D%2Fsrc%2FApp.js)，以了解为不同特定用例添加不同检查。

## 四、去除事件池

 在React 17 以前，如果想要用异步的方式使用事件e，则必须先调用调用 `e.persist()` 才可以，这是因为 React 在旧浏览器中重用了不同事件的事件对象，以提高性能，并将所有事件字段在它们之前设置为 `null`。如下面的例子：

```jsx
function FunctionComponent(props) {
  const [val, setVal] = useState("");

  const handleChange = e => {
    // setVal(e.target.value);
    
    // React 17以前，如果想用异步的方式使用事件e，必须要加上下面的e.persist()才可以
    // e.persist();
    // setVal(data => e.target.value);
  };
  return (
    <div className="border">
      <input type="text" value={val} onChange={handleChange} />
    </div>
  );
}
复制代码
```

 但是这种使用方式有点抽象，经常会让对React不太熟悉的开发者懵掉，但是值得开心的是，React 17 中移除了 “event pooling（事件池）“，因为以前加入事件池的概念是为了提升旧浏览器的性能，对于现代浏览器来说，已经不需要了。因此，上面的代码中不使用e.persist();也能达到预期效果。

## 五、副作用清理时间

 React 17以前，当组件被卸载时，useEffect和useLayoutEffect的清理函数都是同步运行，但是对于大型应用程序来说，这不是理想选择，因为同步会减缓屏幕的过渡（例如，切换标签），因此**React 17中的useEffect的清理函数异步执行**，也就是说如果要卸载组件，则清理会在屏幕更新后运行。如果你某些情况下你仍然希望依靠同步执行，可以用 `useLayoutEffect`。

 当然React 17中的useEffect的清理函数异步执行之后，有一个隐患：

```jsx
useEffect(() => {
  someRef.current.someSetupMethod();
  return () => {
    someRef.current.someCleanupMethod();
  };
});
复制代码
```

 问题在于 `someRef.current` 是可变的，因此在运行清除函数时，它可能已经设置为 `null`。解决方案是在副作用**内部**存储会发生变化的值：

```jsx
useEffect(() => {
  const instance = someRef.current;
  instance.someSetupMethod();
  return () => {
    instance.someCleanupMethod();
  };
});
复制代码
```

我们不希望此问题对大家造成影响，我们提供了 [`eslint-plugin-react-hooks/exhaustive-deps` 的 lint 规则](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmaster%2Fpackages%2Feslint-plugin-react-hooks)（请确保在项目中使用它）会对此情况发出警告。

## 六、返回一致的 undefined 错误

 在 React 16 及更早版本中，返回 `undefined` 始终是一个错误，当然这是React的预期，但是由于编码错误 ，`forwardRef` 和 `memo` 组件的返回值是undefined的时候没有做为错误，React 17中修复了这个问题。React中要求对于不想进行任何渲染的时候返回 `null`。

## 七、原生组件栈

 **在 React 17 中，使用了不同的机制生成组件调用栈，该机制会将它们与常规的原生 JavaScript 调用栈缝合在一起。这使得你可以在生产环境中获得完全符号化的 React 组件调用栈信息。**

## 八、移除私有导出

 React 17删除了一些以前暴露给其他项目的 React 内部组件。特别是，[React Native for Web](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fnecolas%2Freact-native-web) 过去常常依赖于事件系统的某些内部组件，但这种依赖关系很脆弱且经常被破坏。

 **在 React 17 中，这些私有导出已被移除。据我们所知，React Native for Web 是唯一使用它们的项目，它们已经完成了向不依赖那些私有导出函数的其他方法迁移。**

## 九、启发式更新算法更新

 React 16开始替换掉了`Stack Reconciler`，开始使用启发式算法架构的的`Fiber Reconciler`。那么为什么要发生这个改变呢？

React的killer feature： virtual dom

> - React15.x - Stack Reconciler
> - React16 - Fiber Reconciler
> - React17 - Fiber Reconciler (进阶版 - 优先级区间)

1. 为什么需要fiber

   对于大型项目，组件树会很大，这个时候递归遍历的成本就会很高，会造成主线程被持续占用，结果就是主线程上的布局、动画等周期性任务就无法立即得到处理，造成视觉上的卡顿，影响用户体验。

2. 任务分解的意义

   解决上面的问题

3. 增量渲染（把渲染任务拆分成块，匀到多帧）

4. 更新时能够暂停，终止，复用渲染任务

5. 给不同类型的更新赋予**优先级**

6. 并发方面新的基础能力

7. **更流畅**

![image-20190213100742491](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af337110041b4b9a82d269a0668a69e7~tplv-k3u1fbpfcp-watermark.awebp)

![image-20190213100810277](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c55f16195371438682f8c5b5a5b075cd~tplv-k3u1fbpfcp-watermark.awebp)

 React 17中更新了启发式更新算法，具体表现为曾经用于标记fiber节点更新优先级的expirationTime换成了为lanes，前者为普通数字，而后者则为32位的二进制，了解二进制运算的都比较熟悉了，这种二进制的lanes是可以指定几个优先级的，而不是像以前expirationTime只能标记一个。

 之所以做这种改变，原因就是在于`expirationTimes模型`不能满足`IO操作`（Suspense），Suspense用法如下：

```jsx
<React.Suspense fallback={<Loading />}>
   <Content />
</React.Suspense>
```

