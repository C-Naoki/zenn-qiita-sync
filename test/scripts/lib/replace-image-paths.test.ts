import { replaceImagePaths } from '../../../scripts/lib/replace-image-paths';

describe('replaceImagePaths', () => {
  const githubRawUrl = 'https://raw.githubusercontent.com/C-Naoki/zenn-qiita-sync/main';

  it('should replace basic relative image paths with githubRawUrl', () => {
    const input = '![alt text](/images/basic.png)';
    const expected = `![alt text](${githubRawUrl}/images/basic.png)`;
    expect(replaceImagePaths(input)).toBe(expected);
  });

  it('should remove size attributes from image paths and replace with githubRawUrl', () => {
    const input = '![alt text with size](/images/sized.jpg =100x200)';
    const expected = `![alt text with size](${githubRawUrl}/images/sized.jpg)`;
    expect(replaceImagePaths(input)).toBe(expected);
  });

  it('should not modify image paths inside code blocks', () => {
    const input = '```markdown\n![alt text in code](/images/code.gif)\n```';
    const expected = '```markdown\n![alt text in code](/images/code.gif)\n```';
    expect(replaceImagePaths(input)).toBe(expected);
  });

  it('should handle multiple image replacements in a single string', () => {
    const input = '![first image](/images/first.webp)\nSome text in between.\n![second image](/images/second.jpeg =50x50)';
    const expected = `![first image](${githubRawUrl}/images/first.webp)\nSome text in between.\n![second image](${githubRawUrl}/images/second.jpeg)`;
    expect(replaceImagePaths(input)).toBe(expected);
  });

  it('should handle images with spaces in alt text and path', () => {
    const input = '![alt with spaces](/images/with spaces.png)';
    const expected = `![alt with spaces](${githubRawUrl}/images/with spaces.png)`;
    expect(replaceImagePaths(input)).toBe(expected);
  });

  it('should handle images with special characters in alt text', () => {
    const input = '![alt-text_1.2](/images/special.png)';
    const expected = `![alt-text_1.2](${githubRawUrl}/images/special.png)`;
    expect(replaceImagePaths(input)).toBe(expected);
  });
});