import {useEffect, useState, useTransition, Suspense} from "react";
import {fetchProfileData} from "../utils";

const initialResource = fetchProfileData();

export default function TransitionPage(props) {
  const [resource, setResource] = useState(initialResource);

  // useEffect(() => {
  //   console.log("resource", resource); //sy-log
  // }, [resource]);

  return (
    <div>
      <h3>TransitionPage</h3>
      <Suspense fallback={<h1>loading</h1>}>
        <User resource={resource} />
      </Suspense>

      <Button
        refresh={() => {
          setResource(fetchProfileData());
        }}
      />
    </div>
  );
}

function User({resource}) {
  const user = resource.user.read();
  return (
    <div>
      <p>{user.name}</p>
    </div>
  );
}

function Button({refresh}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border">
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
