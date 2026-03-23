import { gql } from '@apollo/client';

export const GET_HEALTH_ARTICLES = gql`
  query GetHealthArticles($first: Int!, $after: String) {
    tag(slug: "health") {
      posts(first: $first, after: $after, filter: { sortBy: recent }) {
        edges {
          node {
            id
            title
            brief
            coverImage {
              url
            }
            author {
              name
              profilePicture
            }
            readTimeInMinutes
            tags {
              name
            }
            reactionCount
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_HEALTH_ARTICLE = gql`
  query GetHealthArticle($id: ID!) {
    post(id: $id) {
      id
      title
      content {
        text
      }
      coverImage {
        url
      }
      author {
        name
        profilePicture
      }
      readTimeInMinutes
      tags {
        name
      }
      reactionCount
    }
  }
`;
