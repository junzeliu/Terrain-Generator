## Introduction

This is a project related to Interactive Computer Graphic technique, using WebGL and Diamond-Square algorithm to randomly generate terrain automatically. 

![alt text][logo]

[logo]: images/screen_shot.png "Screenshot of Terrain"

## Diamond-Square Algorithm

The diamond-square algorithm begins with a 2D square array of width and height 2n + 1. The four corner points of the array must firstly be set to initial values. The diamond and square steps are then performed alternately until all array values have been set.

__The diamond step:__ For each square in the array, set the midpoint of that square to be the average of the four corner points plus a random value.

__The square step:__ For each diamond in the array, set the midpoint of that diamond to be the average of the four corner points plus a random value.

At each iteration, the magnitude of the random value should be reduced.

During the square steps, points located on the edges of the array will have only three adjacent values set rather than four. There are a number of ways to handle this complication - the simplest being to take the average of just the three adjacent values. Another option is to 'wrap around', taking the fourth value from the other side of the array. When used with consistent initial corner values this method also allows generated fractals to be stitched together without discontinuities.

![Hello](images/Diamond_Square.png "from Wikipedia")
[Read more](https://en.wikipedia.org/wiki/Diamond-square_algorithm)

## Implementation
(implemented in Javascript)

The Diamond step and Square step should be called one after another interactively, to generate altitude of terrain.

@param {Array} x-y plane mesh array of vertices<br/>
@param {number} length of side of the x-y plane (a 2D array)<br/>
@param {number} how much the random height addition gets shrunk<br/>

```markdown
function diamondSquare(inputArray, n, scale)
{
    inputArray[0][0] = 0.01; 
    inputArray[0][n] = 0.01; 
    inputArray[n][0] = 0.01; 
    inputArray[n][n] = 0.01; 
    var l = n / 2; 
    while (l >= 1)
    {
        diamond(inputArray, l, n, scale); 
        square(inputArray, l, n, scale); 
        l /= 2; 
        scale *= 0.6; 
    }
}
```

Function diamond() completes the diamond step. 

@param {Array} x-y plane mesh array of vertices
@param {number} stride of each step calculation
@param {number} length of side of the x-y plane (a 2D array)
@param {number} how much the random height addition gets shrunk

```markdown
function diamond(inputArray, stride, n, scale)
{
    for(var i=stride; i<n+1; i+=2*stride)
    {
        for(var j=stride; j<n+1; j+=2*stride)
        {
            var lb = inputArray[i-stride][j-stride]; 
            var lt = inputArray[i+stride][j-stride]; 
            var rt = inputArray[i+stride][j+stride]; 
            var rb = inputArray[i-stride][j+stride]; 
            if(inputArray[i][j]==0.0 || inputArray[i][j] == 0.001)
            {
                inputArray[i][j] = (lb+lt+rt+rb)/4 + scale*(Math.random()); 
            }
        }
    }
}
```

Function square() completes the square step. 

@param {Array} x-y plane mesh array of vertices
@param {number} stride of each step calculation
@param {number} length of side of the x-y plane (a 2D array)
@param {number} how much the random height addition gets shrunk
```markdown
function square(inputArray, stride, n, scale) 
{
    for(var i=0; i<n+1; i+=stride)
    {
        for(var j=0; j<n+1; j+=stride)
        {
            if(i-stride >= 0) var top = inputArray[i-stride][j]; 
            if(i+stride < n+1) var bottom = inputArray[i+stride][j]; 
            if(j-stride >= 0) var left = inputArray[i][j-stride]; 
            if(j+stride < n+1) var right = inputArray[i][j+stride]; 
            if(inputArray[i][j] == 0.0 || inputArray[i][j] == 0.001)
            {
              if((i>=stride) && (i<n+1-stride) && (j>=stride) && (j<n+1-stride)) 
              {
                  inputArray[i][j] = (top+bottom+left+right)/4 + scale*(Math.random()); 
              }
              else if(i==0 && j-stride>=0 && j+stride<n+1) 
              {
                  inputArray[i][j] = (bottom+left+right)/3 + scale*(Math.random()); 
              }
              else if(i==n && j-stride>=0 && j+stride<n+1)
              {
                  inputArray[i][j] = (top+left+right)/3 + scale*(Math.random());
              }
                else if(j==0 && i-stride>=0 && i+stride<n+1)
              {
                  inputArray[i][j] = (top+bottom+right)/3 + scale*(Math.random());
              }
              else if(j==n && i-stride>=0 && i+stride<n+1)
              {
                  inputArray[i][j] = (top+bottom+left)/3 + scale*(Math.random()); 
              }
            }
        }
    }
}
```

For more details see [terrainModeling.js](https://github.com/JustinLiu412/Terrain-Generator/blob/master/terrainModeling.js).

### [DEMO](Flight.html)

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
