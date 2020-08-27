/*
Chrome extension documentation
https://developer.chrome.com/extensions/runtime#method-sendMessage
*/

// Get current domain
let domain = window.location.hostname;
domain = domain
  .replace('http://', '')
  .replace('https://', '')
  .replace('www.', '')
  .split(/[/?#]/)[0];

let domain_name = domain.replace('.com', '');

// Send domain message
chrome.runtime.sendMessage(
  { command: 'fetch', data: { domain: domain } },
  (response) => {
    // Response from the database to background.html
    console.log('Response from firebase', response);
    parseCoupons(response.data, domain);
  }
);

// Send submit coupon
const submitCoupon = (code, desc, domain) => {
  chrome.runtime.sendMessage(
    { command: 'post', data: { code: code, desc: desc, domain: domain } },
    (response) => {
      // check input is valid
      if (document.querySelector('._chaching_submit__overlay input').value == '') {
        alert('Please enter a valid input!');
      } else {
        document.querySelector('._chaching_submit__overlay').style.display = 'none';
        console.log(response);
        alert('Coupon Submitted!');
      }
    }
  );
};

const parseCoupons = (coupons, domain) => {
  try {
    let couponHTML = '';
    // loop over coupons in coupon's list
    for (let key in coupons) {
      let coupon = coupons[key];
      couponHTML +=
        '<li><span class="code">' +
        coupon.code +
        '</span>' +
        '<p>' +
        coupon.desc +
        '</p></li>';
    }
    // Display message if there is no coupon
    if (couponHTML === '') {
      couponHTML = '<p>Be the first to submit a coupon for this site!</p>';
    }

    // display coupon list
    const couponDisplay = document.createElement('div');
    couponDisplay.className = '_chaching_coupon__list';
    couponDisplay.innerHTML =
      '<header class="_chaching__header">' +
      '<img class="_chaching__storelogo" src="https://graph.facebook.com/' +
      domain_name +
      '/picture?type=small">'+
      '<div class="_chaching__heading">'+
      domain +
      '</div>' +
      '</header>' + 
      // HOME TAB
      '<main class="_chaching__content _chaching__home__content"><div class="_chaching__submit-button">Submit A Coupon</div>' +
      // '<p>Browse coupons below that have been used for <strong>' +
      // domain +
      // '</strong></p>' +
      '<p>Click any coupon to copy &amp; use</p>' +
      '<ul>' +
      couponHTML +
      '</ul></main>' + 
      // LIST TAB
      '<main class="_chaching__content" style="display: none">list</main>'+
      // ACCOUNT TAB
      '<main class="_chaching__content"  style="display: none">account</main>' +
      '<footer class="_chaching__footer">' +
      '<ul>' +
      '<li class="_chaching__nav_item">' +
      '<a class="_chaching__home" tabindex="0"><img src="https://firebasestorage.googleapis.com/v0/b/chaching-light.appspot.com/o/icon_home.png?alt=media&amp;token=126e04ee-1553-433d-ac95-40bd73aaf91f"></a>' +
      '</li><li class="_chaching__nav_item">' +
      '<a class="_chaching__list" tabindex="0"><img src="https://firebasestorage.googleapis.com/v0/b/chaching-light.appspot.com/o/icon_list.png?alt=media&token=c43f436b-288c-4215-86dc-9bd927f4e9aa"></a>' +
      '</li><li class="_chaching__nav_item">' + 
      '<a class="_chaching__account" tabindex="0"><img src="https://firebasestorage.googleapis.com/v0/b/chaching-light.appspot.com/o/icon_account.png?alt=media&token=f39cd090-6039-44d0-99e2-6189893a840c"></a>' +
      '</li>' +
      '</ul>' +
      '</footer>';
    document.body.appendChild(couponDisplay);

    // button to show list of coupons
    const couponButton = document.createElement('div');
    couponButton.className = '_chaching_coupon__button';
    couponButton.innerHTML = '<span class="lets-party>🥳</span>';
    document.body.appendChild(couponButton);

    // Submit coupon button
    const couponSubmitOverlay = document.createElement('div');
    couponSubmitOverlay.className = '_chaching_submit__overlay';
    couponSubmitOverlay.innerHTML =
      '<span class="_chaching_close-button"><img src="https://firebasestorage.googleapis.com/v0/b/chaching-light.appspot.com/o/icon_close.png?alt=media&token=07dc5fb6-02aa-440d-a348-c21eef232145"></span>' +
      '<h3>Do you have a coupon for this site?</h3>' +
      '<div><label>Code:</label><input type="text" class="code"/></div>' +
      '<div><label>Description:</label><input type="text" class="desc"/></div>' +
      '<div><button class="_chaching__submit-button">Submit</button></div>';
    couponSubmitOverlay.style.display = 'none';
    document.body.appendChild(couponSubmitOverlay);

    displayCouponList();
  } catch (e) {
    console.log('No coupon found for this domain', e);
  }
};

const displayCouponList = () => {
  // Show submit overlay
  document
    .querySelector('._chaching_coupon__list ._chaching__submit-button')
    .addEventListener('click', () => {
      document.querySelector('._chaching_submit__overlay').style.display = 'block';
    });
  // Close submit overlay
  document
    .querySelector('._chaching_submit__overlay ._chaching_close-button')
    .addEventListener('click', () => {
      console.log('close overlay');
      document.querySelector('._chaching_submit__overlay').style.display = 'none';
    });

  // Show/hide list of coupons
  document.querySelector('._chaching_coupon__button').addEventListener('click', () => {
    if (document.querySelector('._chaching_coupon__list').style.display === 'block') {
      document.querySelector('._chaching_coupon__list').style.display = 'none';
      document.querySelector('._chaching_coupon__button').innerHTML = '<span class="lets-party">🥳</span>';
    } else {
      document.querySelector('._chaching_coupon__list').style.display = 'block';
      document.querySelector('._chaching_coupon__button').innerHTML = '<img src="https://firebasestorage.googleapis.com/v0/b/chaching-light.appspot.com/o/icon_close.png?alt=media&token=07dc5fb6-02aa-440d-a348-c21eef232145">';
    }
  });

  // Submit coupon to db
  document
    .querySelector('._chaching_submit__overlay ._chaching__submit-button')
    .addEventListener('click', () => {
      const code = document.querySelector('._chaching_submit__overlay .code').value;
      const desc = document.querySelector('._chaching_submit__overlay .desc').value;
      submitCoupon(code, desc, domain);
    });

  // Copy coupon on click
  document.querySelectorAll('._chaching_coupon__list .code').forEach((codeItem) => {
    codeItem.addEventListener('click', () => {
      const codeStr = codeItem.innerHTML;
      copyToClipboard(codeStr);
    });
  });
};

// Copy to clipboard
const copyToClipboard = (str) => {
  const input = document.createElement('textarea');
  input.innerHTML = str;
  document.body.appendChild(input);
  input.select();
  const result = document.execCommand('copy');
  document.body.removeChild(input);
  return result;
};

// tab navigation home | list | account
