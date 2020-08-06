var firebaseConfig = {
  apiKey: 'AIzaSyDE76wJV9TqaaOp3eVFknlEqdm598ZUkCs',
  authDomain: 'coupon-finder-e0dee.firebaseapp.com',
  databaseURL: 'https://coupon-finder-e0dee.firebaseio.com',
  projectId: 'coupon-finder-e0dee',
  storageBucket: 'coupon-finder-e0dee.appspot.com',
  messagingSenderId: '864265436810',
  appId: '1:864265436810:web:75f9f3ae6f8383209b3773'
};

firebase.initializeApp(firebaseConfig);

// Get the message from browser
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // Fetch coupons from db
  if (msg.command == 'fetch') {
    const domain = msg.data.domain;
    const encoded_domain = btoa(domain);
    firebase
      .database()
      .ref('/domain/' + encoded_domain)
      .once('value')
      .then((snapshot) => {
        response({
          type: 'result',
          status: 'success',
          data: snapshot.val(),
          request: msg
        });
      });
  }
  // Post coupons to db
  if (msg.command == 'post') {
    const domain = msg.data.domain;
    const encoded_domain = btoa(domain);
    const code = msg.data.code;
    const desc = msg.data.desc;
    try {
      const newPost = firebase
        .database()
        .ref('/domain/' + encoded_domain)
        .push()
        .set({ code, desc });
      const postId = newPost.key;
      // send response to background.html
      response({
        type: 'result',
        status: 'success',
        data: postId,
        request: msg
      });
    } catch (e) {
      response({
        type: 'result',
        status: 'fail',
        data: e,
        request: msg
      });
    }
  }
  return true;
});
