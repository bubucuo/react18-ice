# 提前掌握React 18 

[toc]

## 资源

1. [React18发布计划](https://react.docschina.org/blog/2021/06/08/the-plan-for-react-18.html)
2. [React 18讨论区](https://github.com/reactwg/react-18/discussions)
3. [React 18中的自动批处理 (Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21) )
4. [React18的ssr的新Suspense(New Suspense SSR Architecture in React 18)](https://github.com/reactwg/react-18/discussions/37)
5. [React18的Suspense的变化(Behavioral changes to Suspense in React 18)](https://github.com/reactwg/react-18/discussions/47#discussioncomment-847004)
6. [startTransition](https://github.com/reactwg/react-18/discussions/41)

   

## 正文

![image-20210609110752720](https://tva1.sinaimg.cn/large/008i3skNgy1grbu7moxb4j31ar0u07kz.jpg)

**React 18 Alpha已经发版。**

作为初步预览React18的Alpha版，大部分的新增特性已经敲定，但是仍然有些工作未完成。



### React 18会带来什么

React18发版以后，预计会带来以下变化：

1. 改进已有属性，如**自动批量处理**、**改进Suspense、组件返回undefined不再报错**等。
2. **支持Concurrent模式，带来新的API**，如[startTransition](https://github.com/reactwg/react-18/discussions/41)、useDeferredValue等。

为了支持以上特性，React18不仅加入了多任务处理，还加入了基于优先级的渲染、调度和打断。

React18加入的新的模式，即"并发渲染（concurrent rendering）"模式，当然这个模式是可选的（爱用不用），这个模式也使得React能够同时支持多个UI版本。这个变化对于开发者来说大部分是不可见的，但是它解锁了React应用在性能提升方面的一些新特性。

最后，不用担心，我们无需重写代码就能够使用React18。



### 试用React18 Alpha

#### 创建应用

```bash
npx create-react-app react18-ice
cd react18-ice
yarn add react@alpha react-dom@alpha
yarn start
```



把src/index.js

```jsx
ReactDOM.render(<App/>, document.getElementById("root"));
```

换成

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```



#### Concurrent 模式

Concurrent 模式是一组 React 的新功能，可帮助应用保持响应，并根据用户的设备性能和网速进行适当的调整。

**在 Concurrent 模式中，React 可以 同时 更新多个状态** —— 就像分支可以让不同的团队成员独立地工作一样：

- 对于 CPU-bound 的更新 (例如创建新的 DOM 节点和运行组件中的代码)，并发意味着一个更急迫的更新可以“中断”已经开始的渲染。
- 对于 IO-bound 的更新 (例如从网络加载代码或数据)，并发意味着 React 甚至可以在全部数据到达之前就在内存中开始渲染，然后跳过令人不愉快的空白加载状态。

重要的是，你 *使用* React 的方式是相同的。components，props，和 state 等概念的基本工作方式是相同的。当你想更新屏幕，设置 state 即可。

React 使用一种启发式方法决定更新的“紧急性”，并且允许你用几行代码对其进行调整，以便你可以在每次交互中实现理想的用户体验。



简单来说，Concurrent模式想做到的事情就是用户可以自定义更新任务优先级并且能够通知到React，React再来处理不同优先级的更新任务，当然，优先处理高优先级任务，并且低优先级任务可以中断。

Concurrent 模式减少了防抖和节流在 UI 中的需求。因为渲染是可以中断的，React 不需要人为地 *延迟* 工作以避免卡顿（比如使用setTimeout）。它可以立即开始渲染，但是当需要保持应用响应时中断这项工作。



![image-20210624145413963](https://tva1.sinaimg.cn/large/008i3skNgy1grtd1lqsxhj31600guaiw.jpg)



#### 组件返回undefined不再报错

相关issues：[Update to allow components to render undefined]( https://github.com/reactwg/react-18/discussions/75)                      

```jsx
export default function UndefinedPage(props) {
  return undefined;
}
```

React以前之所以返回undefined会报错，是为了帮助用户快速排错，因为用户可能会忘记返回组件。这是当时2017年把组件返回undefined报错处理的原因，但是现在来看呢，今时不同往日了，现在的类型检测工具都非常流行并且可靠了，比如ts。所以现在React可以不再帮助用户排查忘记给组件添加返回值的情况了。

并且还有一点，这个改动和React18之后的特性也相关。比如Suspense，如果我不想要fallback所以才赋值undefined，但是React报错，这理论上有点矛盾。

还有这点改动对服务端也很重要，因为要接受来自服务端的children，返回undefined报错会增加复杂性，还是简单点吧。

源码截图：

![image-20210806144917090](https://tva1.sinaimg.cn/large/008i3skNly1gt72jps9ioj31610u0grv.jpg)

#### 自动批处理

批处理：为了性能考虑，如果有多个状态更新，React会统一处理，组件只会渲染一次。

```jsx
export default function SetStatePage(props) {
  console.log("omg"); //sy-log
  const [count, setCount] = useState(0);
  const handle = () => {
     setCount(count + 1);
     setCount(count + 2);
  };

  return (
    <div>
      <h3>SetStatePage</h3>
      <button onClick={handle}>{count}</button>
    </div>
  );
}
```



##### 非批处理

可以使用ReactDOM.flushSync。建议尽量不要这么做。

```jsx
export default function SetStatePage(props) {
  console.log("omg"); //sy-log
  const [count, setCount] = useState(0);
  const handle = () => {
    ReactDOM.flushSync(() => {
      setCount(count + 1);
    });
    ReactDOM.flushSync(() => {
      setCount(count + 2);
    });
  };

  return (
    <div>
      <h3>SetStatePage</h3>
      <button onClick={handle}>{count}</button>
    </div>
  );
}
```



#### Suspense

用于数据获取。

可以“等待”目标代码加载，并且可以直接指定一个加载的界面（像是个 spinner），让它在用户等待的时候显示。

`fallback`定义loading显示

```jsx
import {useState, Suspense} from "react";
import User from "../components/User";
import Num from "../components/Num";
import {fetchData} from "../utils";
import ErrorBoundaryPage from "./ErrorBoundaryPage";

const initialResource = fetchData();

export default function SuspensePage(props) {
  const [resource, setResource] = useState(initialResource);

  return (
    <div>
      <h3>SuspensePage</h3>
      <ErrorBoundaryPage fallback={<h1>网络出错了</h1>}>
        <Suspense fallback={<h1>loading - user</h1>}>
          <User resource={resource} />
        </Suspense>
      </ErrorBoundaryPage>

      <Suspense fallback={<h1>loading-num</h1>}>
        <Num resource={resource} />
      </Suspense>

      <button onClick={() => setResource(fetchData())}>refresh</button>
    </div>
  );
}
```



##### 错误处理

每当使用 Promises，大概率我们会用 `catch()` 来做错误处理。但当我们用 Suspense 时，我们不*等待* Promises 就直接开始渲染，这时 `catch()` 就不适用了。这种情况下，错误处理该怎么进行呢？

在 Suspense 中，获取数据时抛出的错误和组件渲染时的报错处理方式一样——你可以在需要的层级渲染一个[错误边界](https://zh-hans.reactjs.org/docs/error-boundaries.html)组件来“捕捉”层级下面的所有的报错信息。

```jsx
export default class ErrorBoundaryPage extends React.Component {
  state = {hasError: false, error: null};
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```



#### SuspenseList

用于控制Suspense组件的显示顺序。

##### `revealOrder` Suspense加载顺序

`together` 所有Suspense一起显示，也就是最后一个加载完了才一起显示全部

`forwards` 按照顺序显示Suspense

`backwards` 反序显示Suspense

##### `tail`是否显示fallback，只在revealOrder为forwards或者backwards时候有效

`hidden`不显示

`collapsed`轮到自己再显示



```jsx
import {useState, Suspense, SuspenseList} from "react";
import User from "../components/User";
import Num from "../components/Num";
import {fetchData} from "../utils";
import ErrorBoundaryPage from "./ErrorBoundaryPage";

const initialResource = fetchData();

export default function SuspenseListPage(props) {
  const [resource, setResource] = useState(initialResource);

  return (
    <div>
      <h3>SuspenseListPage</h3>
      <SuspenseList tail="collapsed">
        <ErrorBoundaryPage fallback={<h1>网络出错了</h1>}>
          <Suspense fallback={<h1>loading - user</h1>}>
            <User resource={resource} />
          </Suspense>
        </ErrorBoundaryPage>

        <Suspense fallback={<h1>loading-num</h1>}>
          <Num resource={resource} />
        </Suspense>
      </SuspenseList>

      <button onClick={() => setResource(fetchData())}>refresh</button>
    </div>
  );
}
```



#### startTransition

![image-20210802113233265](https://tva1.sinaimg.cn/large/008i3skNgy1gt2adrqqf5j30u40dewfi.jpg)

**用途：**标记某个更新为transition。

`startTransition`包裹里的更新函数被当做是非紧急事件，如果有别的紧急更新（urgent update）进来，那么这个`startTransition`包裹里的更新则会被打断。

##### transition

React把状态更新分成两种：

- **Urgent updates** 紧急更新，指直接交互。如点击、输入、滚动、拖拽等
- **Transition updates**  过渡更新，如UI从一个视图向另一个视图的更新

> 双缓冲-[百度百科](https://baike.baidu.com/item/%E5%8F%8C%E7%BC%93%E5%86%B2/10953356?fr=aladdin)
>
> 我们看电视时，看到的屏幕称为OSD层，也就是说，只有在OSD层上显示图像我们才能看到。现在，我需要创建一个虚拟的、看不见但是可以在上面画图（比如说画点、线）的OSD层，我称之为offscreen（后台缓冲区）。这个offscreen存在于内存中，我们在上面画图，这个offscreen上面的东西可以显示在OSD层上，需要一个创建这个offscreen的函数，返回这个offscreen的句柄（整型[指针](https://baike.baidu.com/item/指针/2878304)）、宽度、高度、指向新建offscreen[数据缓冲区](https://baike.baidu.com/item/数据缓冲区/1380388)的指针，该缓冲区是一个在函数外创建的offscreen的数据缓冲区，大小是offscreen的高度*宽度*每个像素点数据的大小。闪烁是图形编程的一个常见问题。需要多重复杂绘制操作的图形操作会导致呈现的图像闪烁或具有其他不可接受的外观。双缓冲的使用解决这些问题。双缓冲使用内存缓冲区来解决由多重绘制操作造成的闪烁问题。当启用双缓冲时，所有绘制操作首先呈现到内存缓冲区，而不是屏幕上的绘图图面。所有绘制操作完成后，内存缓冲区直接复制到与其关联的绘图图面。因为在[屏幕](https://baike.baidu.com/item/屏幕/3750314)上只执行一个图形操作，所以消除了由复杂绘制操作造成的图像闪烁。



用法如下:

```jsx
import {useEffect, useState, Suspense} from "react";
import Button from "../components/Button";
import User from "../components/User";
import Num from "../components/Num";
import {fetchData} from "../utils";

const initialResource = fetchData();

export default function TransitionPage(props) {
  const [resource, setResource] = useState(initialResource);

  // useEffect(() => {
  //   console.log("resource", resource); //sy-log
  // }, [resource]);

  return (
    <div>
      <h3>TransitionPage</h3>
      <Suspense fallback={<h1>loading - user</h1>}>
        <User resource={resource} />
      </Suspense>

      <Suspense fallback={<h1>loading-num</h1>}>
        <Num resource={resource} />
      </Suspense>

      <Button
        refresh={() => {
          setResource(fetchData());
        }}
      />
    </div>
  );
}
```

Button

```jsx
import {
  //startTransition,
  useTransition,
} from "react";

export default function Button({refresh}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border">
      <h3>Button</h3>
      <button
        onClick={() => {
          startTransition(() => {
            refresh();
          });
        }}
        disabled={isPending}>
        点击刷新数据
      </button>
      {isPending ? <div>loading...</div> : null}
    </div>
  );
}
```



##### 与setTimeout异同

在`startTransition`出现之前，我们可以使用`setTimeout`来实现优化。但是现在在处理上面的优化的时候，有了`startTransition`基本上可以抛弃`setTimeout`了，原因主要有以三点：

首先，与`setTimeout`不同的是，`startTransition`并不会延迟调度，而是会立即执行，`startTransition`接收的函数是同步执行的，只是这个update被加了一个“transitions"的标记。而这个标记，React内部处理更新的时候是会作为参考信息的。这就意味着，相比于`setTimeout`， 把一个update交给`startTransition`能够更早地被处理。而在于较快的设备上，这个过度是用户感知不到的。



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



##### 源码解读

![image-20210624173627645](https://tva1.sinaimg.cn/large/008i3skNgy1grthqbnz65j314e0kmh7c.jpg)



#### useDeferredValue

使得我们可以**延迟更新**某个不那么重要的部分。

相当于参数版的transitions。

举例：如下图，当用户在输入框输入“书”的时候，用户应该立马看到输入框的反应，而相比之下，下面的模糊查询框如果延迟出现一会儿其实是完全可以接受的，因为用户可能会继续修改输入框内容，这个过程中模糊查询结果还是会变化，但是这个变化对用户来说相对没那么重要，用户最关心的是看到最后的匹配结果。

<img src="https://tva1.sinaimg.cn/large/008i3skNly1grr23is305j30ka0r2tb1.jpg" alt="image-20210609144400423" style="zoom:25%;" />

用法如下：

```jsx
import {useDeferredValue, useState} from "react";
import MySlowList from "../components/MySlowList";

export default function UseDeferredValuePage(props) {
  const [text, setText] = useState("hello");
  const deferredText = useDeferredValue(text);

  const handleChange = (e) => {
    setText(e.target.value);
  };
  return (
    <div>
      <h3>UseDeferredValuePage</h3>
      {/* 保持将当前文本传递给 input */}
      <input value={text} onChange={handleChange} />
      {/* 但在必要时可以将列表“延后” */}
      <p>{deferredText}</p>

      <MySlowList text={deferredText} />
    </div>
  );
}
```

MySlowList

```jsx
import React, {memo} from "react";

function ListItem({children}) {
  let now = performance.now();
  while (performance.now() - now < 3) {}
  return <div className="ListItem">{children}</div>;
}

export default memo(function MySlowList({text}) {
  let items = [];
  for (let i = 0; i < 80; i++) {
    items.push(
      <ListItem key={i}>
        Result #{i} for "{text}"
      </ListItem>
    );
  }
  return (
    <div className="border">
      <p>
        <b>Results for "{text}":</b>
      </p>
      <ul className="List">{items}</ul>
    </div>
  );
});
```

##### 源码解读

![image-20210624173355759](https://tva1.sinaimg.cn/large/008i3skNgy1grthnpzhvrj31160u04qp.jpg)

