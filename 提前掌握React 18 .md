# 提前掌握React 18 

[toc]

## 资源

1. [React18计划](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html)
2. [React 18讨论区](https://github.com/reactwg/react-18/discussions)
3. [React 18中的自动批处理 (Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21) )
4. [React18的ssr的新Suspense(New Suspense SSR Architecture in React 18)](https://github.com/reactwg/react-18/discussions/37)
5. [React18的Suspense的变化(Behavioral changes to Suspense in React 18)](https://github.com/reactwg/react-18/discussions/47#discussioncomment-847004)



## 正文

![image-20210609110752720](https://tva1.sinaimg.cn/large/008i3skNgy1grbu7moxb4j31ar0u07kz.jpg)

**React 18 Alpha已经发版。**

作为初步预览React18的Alpha版，大部分的新增特性已经敲定，但是仍然有些工作未完成，如新API`useMutableSource` 、` useOpaqueIdentifier`还有待继续开发。



### React 18会带来什么

React18发版以后，预计会带来以下变化：

1. 改进已有属性，如**自动批量处理**、**让ssr支持Suspense与Lazy**、**修补Suspense**等。
2. **支持Concurrent模式，带来新的API**，如[startTransition](https://github.com/reactwg/react-18/discussions/41)等。

React18会加入的新的模式，即"并发渲染（concurrent rendering）"模式，当然这个模式是可选的（爱用不用），这个模式也使得React能够同时支持多个UI版本。这个变化对于开发者来说大部分是不可见的，但是它解锁了React应用在性能提升方面的一些新特性。

最后，不用担心，我们无需重写代码就能够使用React18。



### 试用React18 Alpha

#### 创建应用

```bash
npx create-react-app react18-ice
cd react18-ice
yarn add react@alpha react-dom@alpha
```



#### Concurrent 模式

Concurrent 模式是一组 React 的新功能，可帮助应用保持响应，并根据用户的设备性能和网速进行适当的调整。

以上定义来自[React中文网](https://zh-hans.reactjs.org/docs/concurrent-mode-intro.html)。简单来说，Concurrent模式想做到的事情就是用户可以自定义更新任务优先级并且能够通知到React，React再来处理不同优先级的更新任务，当然，优先处理高优先级任务，并且低优先级任务可以中断。

Concurrent 模式减少了防抖和节流在 UI 中的需求。因为渲染是可以中断的，React 不需要人为地 *延迟* 工作以避免卡顿（比如使用setTimeout）。它可以立即开始渲染，但是当需要保持应用响应时中断这项工作。

启动Concurrent模式：

把src/index.js

```jsx
ReactDOM.render(<App/>, document.getElementById("root"));
```

换成

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```



#### Suspense

```jsx
import {Suspense, useEffect, useState} from "react";

const login = new Promise((resolve) => {
  setTimeout(() => {
    resolve({name: "gaoshaoyun"});
  }, 1000);
});

const wrapPromise = (promise) => {
  let status = "pending";
  let result = "";

  let suspender = promise.then((r) => {
    status = "success";
    result = r;
  });

  return {
    read: () => {
      if (status === "pending") {
        throw suspender;
      }
      return result;
    },
  };
};

const loginAction = wrapPromise(login);

export default function App(props) {
  const [name, setName] = useState("");
  // useEffect(() => {
  //   login.then((r) => {
  //     setName(r.name);
  //   });
  // }, []);
  return (
    <div>
      <h3>App</h3>
      <Suspense fallback={<h1>loading。。。</h1>}>
        {/* <p>{name}</p> */}
        <Child />
      </Suspense>
    </div>
  );
}

function Child(props) {
  const user = loginAction.read();
  console.log("name", user); //sy-log
  return <div>{user.name}</div>;
}
```





#### SuspenseList

SuspenseList,可以控制Suspense组件的一个顺序。支持了优先级渲染，中断预渲染等。

##### `revealOrder` Suspense加载顺序

`together` 所有Suspense一起加载

`forwards` 按照顺序加载Suspense

`backwards` 反序加载Suspense

##### **`tail`**  是否显示fallback值

`hidden` 不显示

`collapsed` 则执行当前Suspense之前才显示



#### startTransition

[原文介绍地址](https://github.com/reactwg/react-18/discussions/41)

**用途：**标记某个更新为transitions。



##### transition

React把状态更新分成两种：

- **Urgent updates** 紧急更新，指直接交互。如点击、输入、滚动、拖拽等
- **Transition updates**  过渡更新，如UI从一个视图向另一个视图的更新

举例：如下图，当用户在输入框输入“书”的时候，用户应该立马看到输入框的反应，而相比之下，下面的模糊查询框如果延迟出现一会儿其实是完全可以接受的，因为用户可能会继续修改输入框内容，这个过程中模糊查询结果还是会变化，但是这个变化对用户来说相对没那么重要，用户最关心的是看到最后的匹配结果。

<img src="../../../Library/Application Support/typora-user-images/image-20210609144400423.png" alt="image-20210609144400423" style="zoom:25%;" />



`startTransition`包裹里的更新函数被当做是非紧急事件，如果有别的紧急更新进来那么，那么这个`startTransition`包裹里的更新则会被打断。

用法：

```jsx
import {useState, startTransition} from "react";

function StartTransitionPage(props) {
  const [input, setInput] = useState("");

  const handle = (e) => {
    startTransition(() => {
      setInput(e.target.value);
    });
  };
  return (
    <div>
      <h3>StartTransitionPage</h3>
      <input type="text" value={input} onChange={handle} />
    </div>
  );
}
export default StartTransitionPage;
```



##### 与setTimeout异同

在`startTransition`出现之前，我们可以使用`setTimeout`来实现优化。但是现在在处理上面的优化的时候，有了`startTransition`基本上可以抛弃`setTimeout`了，原因主要有以三点：

首先，与`setTimeout`不同的是，`startTransition`并不会延迟调度，而是会立即执行，`startTransition`接收的函数是同步执行的，只是这个update被加了一个“transitions"的标记。而这个标记，React内部处理更新的时候是会作为参考信息的。这就意味着，相比于`setTimeout`， 把一个update交给`startTransition`能够更早地被处理。而在于较快的设备上，

再者，



##### 使用场景

 `startTransition`可以用在任何你想更新的时候。但是从实际来说，以下是两种典型适用场景：

- 渲染慢：如果你有很多没那么着急的内容要渲染更新。

- 网络慢：如果你的更新需要花较多时间从服务端获取。这个时候也可以再结合`Suspense`。



#### useTransition

在使用startTransition更新状态的时候，用户可能想要知道transition的实时情况，这个时候可以使用React提供的hook api `useTransition`。

```jsx
import { useTransition } from 'react';
const [isPending, startTransition] = useTransition();
```

如果transition未完成，isPending值为true，否则为false。







#### useDeferredValue

使得我们可以**延迟更新**某个不那么重要的部分。

