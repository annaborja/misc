# Image Browser

An interface for managing image assets.
Images can be browsed collectively or grouped by attributes like language code and movie ID.

## Getting Started

First, install [Yarn](https://yarnpkg.com/en/) for dependency management. Then, run the following terminal commands:

```bash
cd image-browser # Navigate to the project's root directory.

yarn install # Install server app dependencies.

cd client && yarn install && cd .. # Install client app dependencies.

yarn dev # Simultaneously run the server and client apps.
```

Access the app at <http://localhost:5001/>. Access the API at <http://localhost:5000/api/images>.

To run tests:
```bash
cd image-browser/client # Navigate to the client app directory.

yarn test # Run the test suite.
```

## Background

Image Browser runs on a **Node.js** back end and **React** front end.
I used [express-generator](https://expressjs.com/en/starter/generator.html) and [create-react-app](https://github.com/facebook/create-react-app) to quickly create skeleton Express and React apps that I then built upon.
My main considerations while building this app were **scalability**, **usability**, **aesthetics**, and **accessibility**.

### Scalability

The example payload given for the exercise is fairly small, but I imagined this app being used to view thousands of images, so scalability was crucial. I implemented infinite scrolling so that not all images would be requested and loaded at once (for this small payload, I used a limit size of 3 as a proof of concept. In real life, the limit would be 20 or larger).

Instead of reading the payload JSON into memory all at once, I used the Oboe.js open-source library to stream the JSON, then I extracted just the information I needed to serve in the API response.

### Usability

I attempted to make the UI easy to use with informative headers, intuitive navigation, and clearly separated image groups. The app is also responsive and mobile-friendly.

### Aesthetics

The styling of Image Browser is heavily influenced by the UI the main website, from the colors to the fonts to the interaction animations. I wanted the app to feel cohesive and in keeping with the company brand.

### Accessibility

I believe that making websites accessible to users with disabilities and who use screen readers is important. Image Browser is navigable by keyboard as well as by mouse.

### Testing

I used Jest and [Enzyme](https://github.com/airbnb/enzyme) to write feature specs covering the main functionality of the app.

## Further Improvements

Given more time, some potential enhancements for the app would be:

* Implement image sorting.
* Display a search box instead of navigation buttons when filtering by an image attribute that has many unique values (for example: in real life, `movieId` would have thousands of unique values).
* Display "human-readable" versions of certain image attributes (for example: display `movieName` in addition to `movieId` when grouping by `movieId`).
* Implement infinite scrolling for image groups, not just individual images (for example: in real life, grouping by `movieId` would result in thousands of groups, so don't load them all at once).
* Support switching between images in the gallery using keyboard arrows.
* Implement i18n (internationalization).
* Use the Flux pattern to organize the app architecture.
