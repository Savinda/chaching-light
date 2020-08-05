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

// Send domain message
chrome.runtime.sendMessage(
  { command: 'fetch', data: { domain: domain } },
  (response) => {
    // Response from the database to background.html
    console.log('Response from firebase', response);
    parseCoupons(response.data, domain);
  }
);

const parseCoupons = (coupons, domain) => {
  try {
    // loop over coupons in coupon's list
    let couponHTML = '';
    coupons.forEach((coupon, index) => {
      couponHTML +=
        '<li><span class="code">' +
        coupon.code +
        '</span>' +
        '<p> &rarr; ' +
        coupon.description +
        '</p></li>';
    });
    // display coupon list
    const couponDisplay = document.createElement('div');
    couponDisplay.className = '_coupon__list';
    couponDisplay.innerHTML =
      '<p>Browse coupons below that have been used for <strong>' +
      domain +
      '</strong></p>' +
      '<p style="font-style: italic;">Click any coupon to copy &amp; use</p>' +
      '<ul>' +
      couponHTML +
      '</ul>';
    document.body.appendChild(couponDisplay);

    // button to show list of coupons
    const couponButton = document.createElement('div');
    couponButton.className = '_coupon__button';
    couponButton.innerHTML = '💰';
    document.body.appendChild(couponButton);

    displayCouponList();
  } catch (e) {
    console.log('No coupon found for this domain', e);
  }
};

const displayCouponList = () => {
  document.querySelector('._coupon__button').addEventListener('click', () => {
    if (document.querySelector('._coupon__list').style.display === 'block') {
      document.querySelector('._coupon__list').style.display = 'none';
      document.querySelector('._coupon__button').innerHTML = '💰';
    } else {
      document.querySelector('._coupon__list').style.display = 'block';
      document.querySelector('._coupon__button').innerHTML = 'X';
    }
  });
};
