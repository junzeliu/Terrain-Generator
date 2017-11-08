## Introduction

This is a project related to Interactive Computer Graphic technique, using WebGL and Diamond-Square algorithm to randomly generate terrain automatically. 

![alt text][logo]

[logo]: images/screen_shot.png "Screenshot of Terrain"

### Diamond-Square Algorithm

The diamond-square algorithm begins with a 2D square array of width and height 2n + 1. The four corner points of the array must firstly be set to initial values. The diamond and square steps are then performed alternately until all array values have been set.

__The diamond step:__ For each square in the array, set the midpoint of that square to be the average of the four corner points plus a random value.

__The square step:__ For each diamond in the array, set the midpoint of that diamond to be the average of the four corner points plus a random value.

At each iteration, the magnitude of the random value should be reduced.

During the square steps, points located on the edges of the array will have only three adjacent values set rather than four. There are a number of ways to handle this complication - the simplest being to take the average of just the three adjacent values. Another option is to 'wrap around', taking the fourth value from the other side of the array. When used with consistent initial corner values this method also allows generated fractals to be stitched together without discontinuities.

![Hello](images/Diamond_Square.png "from Wikipedia")
[Read more](https://en.wikipedia.org/wiki/Diamond-square_algorithm)

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/JustinLiu412/Example/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.

### Git Commands
echo "# Example" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/JustinLiu412/Example.git
git push -u origin master

### URL
https://justinliu412.github.io/Terrain-Generator/
