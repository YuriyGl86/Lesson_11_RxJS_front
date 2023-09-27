import { Observable, of, interval } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

const emails = document.querySelector('.container');

// const url = 'http://localhost:7071/messages/unread/'
const url = 'https://rxjs-backend-mhdh.onrender.com/messages/unread/';

function formatDate(date) {
  let dayOfMonth = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes();

  year = year.toString().slice(-2);
  month = month < 10 ? `0${month}` : month;
  dayOfMonth = dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth;
  hour = hour < 10 ? `0${hour}` : hour;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${dayOfMonth}.${month}.${year} ${hour}:${minutes}`;
}

function renderMail(message) {
  const newMail = document.createElement('div');
  newMail.classList.add('mail-box');

  newMail.innerHTML = `<div class="email"></div>
    <div class="subject"></div>
    <div class="date"></div>`;

  const subject = message.subject.length < 15 ? message.subject : `${message.subject.slice(0, 14)}...`;

  newMail.querySelector('.email').innerText = message.from;
  newMail.querySelector('.subject').innerText = subject;
  newMail.querySelector('.date').innerText = formatDate(new Date(message.received));

  emails.prepend(newMail);
}

function getRequest() {
  return new Observable((observer) => {
    const controller = new AbortController();

    fetch(url, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        observer.next(data);
        observer.complete();
      })
      .catch((err) => observer.error(err));

    return () => controller.abort();
  });
}

const stream$ = interval(3000)
  .pipe(
    switchMap(() => getRequest(url)
      .pipe(
        catchError((err) => {
          console.log(err); // eslint-disable-line no-console

          return of({ messages: [] });
        }),
      )),
    map((value) => value.messages),
  );

stream$.subscribe((messages) => {
  for (const message of messages) {
    renderMail(message);
  }
});
