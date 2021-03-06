import { HtmlElement, DocumentTitle, Section} from "cx/widgets";
import { VDOM } from "cx/ui";

import Controller from "./Controller";

import { getFirebase } from "api";

let ui;

class AuthContainer extends VDOM.Component {
	render() {
		return <div id="firebaseui-auth-container" />;
	}

	componentDidMount() {
		System.import("api/firebase").then(({ firebaseui, firebase }) => {
			// FirebaseUI config.
			var uiConfig = {
				// Url to redirect to after a successful sign-in.
				signInSuccessUrl: "/",
				callbacks: {
					signInSuccess: function(user, credential, redirectUrl) {
						if (window.opener) {
							// The widget has been opened in a popup, so close the window
							// and return false to not redirect the opener.
							window.close();
							return false;
						} else {
							// The widget has been used in redirect mode, so we redirect to the signInSuccessUrl.
							return true;
						}
					}
				},
				signInOptions: [
					// TODO(developer): Remove the providers you don't need for your app.
					firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					firebase.auth.FacebookAuthProvider.PROVIDER_ID,
					firebase.auth.TwitterAuthProvider.PROVIDER_ID,
					firebase.auth.GithubAuthProvider.PROVIDER_ID,
					firebase.auth.EmailAuthProvider.PROVIDER_ID
				],
				// Terms of service url.
				tosUrl: "https://www.google.com"
			};
			// Initialize the FirebaseUI Widget using Firebase.
			if (!ui) ui = new firebaseui.auth.AuthUI(firebase.auth());

			// The start method will wait until the DOM is loaded to include the FirebaseUI sign-in widget
			// within the element corresponding to the selector specified.
			ui.start("#firebaseui-auth-container", uiConfig);
		});
	}
}

export default (
	<cx>
		<DocumentTitle value="Sign In" />
		<Section mod="card" controller={Controller}>
			<h1 putInto="header" />
			<div class="page">
				<div class="prose">
					<h2>Sign In</h2>
					<p>
						By signing in you'll get the ability to save your reports and star reports made by other people.
					</p>
					<p>
						Please choose one of available sign-in options:
					</p>
					<AuthContainer />
				</div>
			</div>
		</Section>
	</cx>
);
