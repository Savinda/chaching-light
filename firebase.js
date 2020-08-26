const firebaseConfig = {
  apiKey: "AIzaSyAhn0Jr9Ka2TGKvsa2lzLxvhjbmbZMPHkQ",
  authDomain: "chaching-light.firebaseapp.com",
  databaseURL: "https://chaching-light.firebaseio.com",
  projectId: "chaching-light",
  storageBucket: "chaching-light.appspot.com",
  messagingSenderId: "896416383985",
  appId: "1:896416383985:web:9ed2d5d73ce83b1b7b7a50",
  measurementId: "G-H4RVKHNQTB"
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
