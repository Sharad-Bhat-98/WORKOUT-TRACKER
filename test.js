// const createPromise = (ms, value, shouldReject = false) => {
//   return new Promise((resolve, reject) => {
//     console.log(`[${value}] Task Started (will take ${ms}ms)`);
//     setTimeout(() => {
//       if (shouldReject) {
//         console.log(`[${value}] Task Finished (Rejected)`);
//         reject(`Error from ${value}`);
//       } else {
//         console.log(`[${value}] Task Finished (Fulfilled)`);
//         resolve(`Result from ${value}`);
//       }
//     }, ms);
//   });
// };
//
// const p1 = createPromise(500, 'A');
// const p2 = createPromise(200, 'B', true);
// const p3 = createPromise(1000, 'C');
//
// console.log('--- Starting Promise.all ---');
//
// Promise.all([p1, p2, p3])
//   .then((results) => {
//     console.log('--- Promise.all SUCCESS ---');
//     console.log(results);
//   })
//   .catch((error) => {
//     console.log('--- Promise.all ERROR ---');
//     console.log(error);
//   });

// 2: 28 PM
// console.log("--- Starting Promise.all ---");
//   --- Promise.all ERROR ---
// Result from ${value}
// Result from ${value}

// const wait = (ms, val) =>
//   new Promise((res) =>
//     setTimeout(() => {
//       console.log(`Task ${val} done`);
//       res(val);
//     }, ms)
//   );
//
// const tasks = [
//   () => wait(300, 'A'),
//   () => wait(100, 'B'),
//   () => wait(200, 'C'),
//   () => wait(400, 'D'),
// ];
//
// const runWithConcurrency = async (tasks, concurrency) => {
//   const results = new Array(tasks.length);
//   let underExecution = 0;
//   // console.log('Sasa');
//   for (let i = 0; i < tasks.length; i++) {
//     const task = tasks[i];
//     // console.log(task);
//     if (underExecution >= concurrency) {
//       await Promise.all(results);
//       underExecution = 0;
//       results.push(task());
//     } else {
//       results.push(task());
//       underExecution += 1;
//     }
//   }
//   return results; // keeps the original order
// };
// runWithConcurrency(tasks, 2).then(console.log);

// B C A D

/*
Task B done
Task A done
Task C done
Task D done
*/

const a = () =>
  new Promise((res, _) => {
    console.log('processed');
    res(true);
  });
const b = () =>
  new Promise((_, rej) => {
    console.log('failed');
    rej(false);
  });

const main = async () => {
  try {
    await Promise.all([b(), a()]);
  } catch (err) {
    console.error(err);
    return;
  }
};
main();
