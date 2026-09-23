import { Redirect } from 'expo-router';

/** Unknown paths (e.g. an old bookmark on the web build) lead back to the home screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
