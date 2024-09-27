import { getPostByIdAPI, getPostsAPI } from "/src/js/api/post/read.js";
import { onDeletePost } from "/src/js/ui/post/delete.js";
import { updatePost } from "/src/js/ui/post/update.js";

let allPosts = [];
let allTags = new Set();

export async function getPosts() {
  try {
    const response = await getPostsAPI();
    console.log("Posts data:", response);

    allPosts = response.data;
    allPosts.forEach((post) => {
      post.tags.forEach((tag) => allTags.add(tag));
    });
    populateTagFilter(allTags);
    postFeed.innerHTML = "";

    renderPosts(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function populateTagFilter(tags) {
  const filterSelect = document.getElementById("filterSelect");
  filterSelect.innerHTML = `<option value="">Filter by Tag</option>`;

  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    filterSelect.appendChild(option);
  });
}

function renderPosts(posts) {
  const postFeed = document.getElementById("postFeed");
  postFeed.innerHTML = "";
  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post p-4 backdrop transition-shadow";
    postElement.innerHTML = `
            <h2 class="text-xl font-semibold text-blue-600">${post.title}</h2>
            <p class="text-gray-700 my-2">${post.body}</p>
            <span class="text-gray-500">Tags: ${post.tags.join(", ")}</span>
            <div class="mt-4">
                <h4 class="text-lg font-semibold text-gray-800">Author: ${
                  post.author?.name || "Unknown"
                }</h4>
                <p class="text-gray-500">Email: ${
                  post.author?.email || "N/A"
                }</p>
            </div>
            ${
              post.media?.url
                ? `<img src="${post.media.url}" alt="${post.media.alt}" class="mt-4" />`
                : ""
            }
            <button onclick="viewPost(${
              post.id
            })" class="bg-blue-600 text-white rounded-md p-2 mt-4 hover:bg-blue-700">View</button>
            <button onclick="deletePost(event, ${
              post.id
            })" class="bg-red-600 text-white rounded-md p-2 mt-4 hover:bg-red-700 ml-4">Delete</button>
            <button onclick="updatePost_(${
              post.id
            })" class="bg-purple-600 text-white rounded-md p-2 mt-4 hover:bg-purple-700 ml-4">Update</button>
        `;
    postFeed.appendChild(postElement);
  });
}
window.updatePost_ = (postId) => updatePost(postId);
window.deletePost = (event, postId) => onDeletePost(event, postId);

export async function viewPost(postId) {
  try {
    const response = await getPostByIdAPI(postId);
    const post = response.data;
    if (!post) {
      throw new Error("Post not found");
    }

    const postFeed = document.getElementById("postFeed");
    postFeed.innerHTML = "";

    const postElement = document.createElement("div");
    postElement.className = "post-detail p-4 backdrop";

    let tagsDisplay = "";
    if (post.tags && post.tags.length > 0) {
      tagsDisplay = `<span class="text-gray-500">Tags: ${post.tags.join(
        ", "
      )}</span>`;
    } else {
      tagsDisplay = `<span class="text-gray-500">Tags: None</span>`; 
    }
    let mediaDisplay = "";
    if (post.media && post.media.url) {
      mediaDisplay = `<img src="${post.media.url}" alt="${
        post.media.alt || "No description"
      }" class="mt-4" />`;
    } else {
      mediaDisplay = `<p class="text-gray-500">No image available</p>`; 
    }
    let commentsDisplay = "";
    if (post._count.comments > 0) {
      commentsDisplay = `<h3 class="text-lg font-semibold mt-4">Comments:</h3>`;
      post.comments.forEach((comment) => {
        commentsDisplay += `
          <div class="comment bg-gray-100 p-2 mt-2 rounded">
            <p><strong>${comment.owner || "Anonymous"}</strong>: ${
          comment.body || "No comment text"
        }</p>
            <span class="text-gray-500">${new Date(
              comment.created
            ).toLocaleDateString()}</span>
          </div>
        `;
      });
    } else {
      commentsDisplay = `<p class="text-gray-500">No comments available</p>`;
    }

    postElement.innerHTML = `
      <h2 class="text-2xl font-bold text-blue-600">${
        post.title || "No title"
      }</h2>
      <p class="text-gray-700 my-4">${post.body || "No content available"}</p>
      ${tagsDisplay} <!-- Only display if tags exist -->
      <p class="text-gray-500">Created at: ${new Date(
        post.created
      ).toLocaleDateString()}</p>
      ${mediaDisplay} <!-- Media display -->
      <button onclick="goBackToPosts()" class="bg-blue-600 text-white rounded-md p-2 mt-4 hover:bg-blue-700">Go Back to Feed</button>
      ${commentsDisplay} <!-- Comments display -->
    `;

    postFeed.appendChild(postElement);
  } catch (error) {
    console.error("Error fetching post details:", error);
    alert("Failed to load post details.");
  }
}
window.viewPost = viewPost;

export function goBackToPosts() {
  renderPosts(allPosts);
}
window.goBackToPosts = goBackToPosts;
document.getElementById("filterSelect").addEventListener("change", (event) => {
  const selectedTag = event.target.value;
  if (selectedTag) {
    const filteredPosts = allPosts.filter((post) =>
      post.tags.includes(selectedTag)
    );
    renderPosts(filteredPosts);
  } else {
    renderPosts(allPosts);
  }
});
document.getElementById("searchInput").addEventListener("input", (event) => {
  const searchText = event.target.value.toLowerCase();
  const filteredPosts = allPosts.filter((post) => {
    return (
      post.title.toLowerCase().includes(searchText) ||
      post.body.toLowerCase().includes(searchText)
    );
  });
  renderPosts(filteredPosts);
});
