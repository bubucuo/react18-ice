# 提前掌握 React 18 （未完成）

[toc]

## 资源

1. [React18 计划](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html)
2. [React 18 讨论区](https://github.com/reactwg/react-18/discussions)

## 正文

![image-20210609110752720](https://tva1.sinaimg.cn/large/008i3skNgy1grbu7moxb4j31ar0u07kz.jpg)

**React 18 Alpha 已经发版。**

作为初步预览 React18 的 Alpha 版，大部分的新增特性已经敲定，但是仍然有些工作未完成，如新 API`useMutableSource` 、`useOpaqueIdentifier`还有待继续开发。

### React 18 会带来什么

React18 发版以后，预计会带来以下变化：

1. 带来开箱即用的提升，如自动批量处理。
2. 带来新的 API，如[startTransition](https://github.com/reactwg/react-18/discussions/41)
3. 支持 React.lazy 的全新 ssr

能够支持以上新特性，是源于 React18 会加入的新的模式，即"并发渲染（concurrent rendering）"模式，当然这个模式是可选的（爱用不用），这个模式也使得 React 能够同时支持多个 UI 版本。这个变化对于开发者来说大部分是不可见的，但是它解锁了 React 应用在性能提升方面的一些新特性。

最后，不用担心，我们无需重写代码就能够使用 React18。

### 窥探 React18 Alpha

#### 创建应用

```bash
npx create-react-app lesson-react18-alpha
cd lesson-react18-alpha
yarn add react@alpha react-dom@alpha
```

#### Concurrent 模式

Concurrent 模式是一组 React 的新功能，可帮助应用保持响应，并根据用户的设备性能和网速进行适当的调整。

以上定义来自[React 中文网](https://zh-hans.reactjs.org/docs/concurrent-mode-intro.html)。简单来说，Concurrent 模式想做到的事情就是用户可以自定义更新任务优先级并且能够通知到 React，React 再来处理不同优先级的更新任务，当然，优先处理高优先级任务，并且低优先级任务可以中断。

Concurrent 模式减少了防抖和节流在 UI 中的需求。因为渲染是可以中断的，React 不需要人为地 _延迟_ 工作以避免卡顿（比如使用 setTimeout）。它可以立即开始渲染，但是当需要保持应用响应时中断这项工作。

#### startTransition

[原文介绍地址](https://github.com/reactwg/react-18/discussions/41)

**用途：**标记某个更新为 transitions。

##### transition

React 把状态更新分成两种：

- **Urgent updates** 紧急更新，指直接交互。如点击、输入、滚动、拖拽等
- **Transition updates** 过渡更新，如 UI 从一个视图向另一个视图的更新

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

##### 与 setTimeout 异同

在`startTransition`出现之前，我们可以使用`setTimeout`来实现优化。但是现在在处理上面的优化的时候，有了`startTransition`基本上可以抛弃`setTimeout`了，原因主要有以三点：

首先，与`setTimeout`不同的是，`startTransition`并不会延迟调度，而是会立即执行，`startTransition`接收的函数是同步执行的，只是这个 update 被加了一个“transitions"的标记。而这个标记，React 内部处理更新的时候是会作为参考信息的。这就意味着，相比于`setTimeout`， 把一个 update 交给`startTransition`能够更早地被处理。而在于较快的设备上，

再者，

##### 使用场景

`startTransition`可以用在任何你想更新的时候。但是从实际来说，以下是两种典型适用场景：

- 渲染慢：如果你有很多没那么着急的内容要渲染更新。

- 网络慢：如果你的更新需要花较多时间从服务端获取。这个时候也可以再结合`Suspense`。

#### useTransition

在使用 startTransition 更新状态的时候，用户可能想要知道 transition 的实时情况，这个时候可以使用 React 提供的 hook api `useTransition`。

```jsx
import {useTransition} from "react";
const [isPending, startTransition] = useTransition();
```

如果 transition 未完成，isPending 值为 true，否则为 false。

#### Suspense

#### SuspenseList

SuspenseList,可以控制 Suspense 组件的一个顺序。支持了优先级渲染，中断预渲染等。

##### `revealOrder` Suspense 加载顺序

`together` 所有 Suspense 一起加载

`forwards` 按照顺序加载 Suspense

`backwards` 反序加载 Suspense

##### **`tail`** 是否显示 fallback 值

`hidden` 不显示

`collapsed` 则执行当前 Suspense 之前才显示

#### useDeferredValue

使得我们可以**延迟更新**某个不那么重要的部分。
