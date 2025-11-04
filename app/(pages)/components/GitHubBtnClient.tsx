"use client";
import GitHubButton from "react-github-btn";

export default function GitHubBtnClient() {
  return (
    <div className="inline-flex items-center">
      <GitHubButton
        href="https://github.com/priynshuchouhn/certifyly"
        data-icon="octicon-star"
        data-size="small"
        data-show-count="true"
        aria-label="Star priynshuchouhn/certifyly on GitHub"
      >
        Star
      </GitHubButton>
    </div>
  );
}
