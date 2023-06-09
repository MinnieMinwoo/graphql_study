import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

let tweets = [
  {
    id: "1",
    text: "first one",
    userId: "2",
  },
  {
    id: "2",
    text: "second one",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "mol",
    lastName: "lu",
  },
  {
    id: "2",
    firstName: "Aro",
    lastName: "na",
  },
];
const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    tweet(_, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      return users;
    },
    allMovies: async () => {
      const data = await (await fetch("https://yts.torrentbay.to/api/v2/list_movies.json")).json();
      return data.data.movies;
    },
    movie: async (_, { id }) => {
      const data = await (
        await fetch(`https://yts.torrentbay.to/api/v2/movie_details.json?movie_id=${id}`)
      ).json();
      return data.data.movie;
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      if (!users.find((user) => user.id === userId)) throw new Error("Invalid user");
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    """
    sum of first name and last name
    """
    fullName: String!
  }
  """
  Tweet object represents a resource for a tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
