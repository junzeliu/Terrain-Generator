/**
 * @fileoverview Utilities for supporting terrain-related calculation.
 */

/**
 * Iteratively generate terrain from numeric inputs
 * @param {number} n
 * @param {number} minX Minimum X value
 * @param {number} maxX Maximum X value
 * @param {number} minY Minimum Y value
 * @param {number} maxY Maximum Y value
 * @param {Array} vertexArray Array that will contain vertices generated
 * @param {Array} faceArray Array that will contain faces generated
 * @param {Array} normalArray Array that will contain normals generated
 * @return {number}
 */
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray, heightArray)
{
    // Restrain the random height added to each vertex from varying too much
    var scale = 0.5; 

    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    var zArray = new Array(n+1); 
    // var nArray = new Array(n+1); 

    // Initialize an empty 2D array storing height values
    for(var i=0;i<=n;i++)
    {
        zArray[i] = new Array(n+1); 
        // nArray[i] = new Array(n+1); 
        for(var j=0;j<=n;j++)
        {
            zArray[i][j] = 0.0;
            // nArray[i][j] = 0.0; 
        }
    }

    // Call diamondSquare function to generate height iterativelly
    diamondSquare(zArray, n, scale); 

    // Set the lower land to be ocean
    for(var i=0; i<n+1; i++)
    {
      for(var j=0; j<n+1; j++)
      {
        if(zArray[i][j]<0.49)
        {
          zArray[i][j] = 0.4+0.05*Math.random();
        }
      }
    }
    // Initialize vertexArray with meshed x-y plane
    // Initialize normalArray with +z axis
    for(var i=0;i<n+1;i++)
       for(var j=0;j<n+1;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(zArray[i][j]);
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(1);
       }

    var numT=0;
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;

           var vertex1=vec3.create();
           var vertex2=vec3.create();
           var vertex3=vec3.create();
           var vertex4=vec3.create();
           var vertex5=vec3.create();
           var vertex6=vec3.create();
           var normal1 =vec3.create();
           var normal2 = vec3.create();

           vec3.set(vertex1,vertexArray[3*vid],vertexArray[3*vid+1],vertexArray[3*vid+2]);  
           vec3.set(vertex2,vertexArray[3*(vid+1)],vertexArray[3*(vid+1)+1],vertexArray[3*(vid+1)+2]);
           vec3.set(vertex3,vertexArray[3*(vid+n+1)],vertexArray[3*(vid+n+1)+1],vertexArray[3*(vid+n+1)+2]);
           vec3.set(vertex4,vertexArray[3*(vid+1)],vertexArray[3*(vid+1)+1],vertexArray[3*(vid+1)+2]);
           vec3.set(vertex5,vertexArray[3*(vid+1+n+1)],vertexArray[3*(vid+1+n+1)+1],vertexArray[3*(vid+1+n+1)+2]);; 
           vec3.set(vertex6,vertexArray[3*(vid+n+1)],vertexArray[3*(vid+n+1)+1],vertexArray[3*(vid+n+1)+2]);;       
                
           normal1 = getNormal(vertex1,vertex2,vertex3);
           normal2 = getNormal(vertex4,vertex5,vertex6);

           // Shading per vertex
           // One face's normal
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           normalArray[3*vid]+=normal1[0];
           normalArray[3*vid+1]+=normal1[1];
           normalArray[3*vid+2]+=normal1[2];
           normalArray[3*(vid+1)]+=normal1[0];
           normalArray[3*(vid+1)+1]+=normal1[1];
           normalArray[3*(vid+1)+2]+=normal1[2];
           normalArray[3*(vid+n+1)]+=normal1[0];
           normalArray[3*(vid+n+1)+1]+=normal1[1];
           normalArray[3*(vid+n+1)+2]+=normal1[2];
           
           // Another face's normal
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           normalArray[3*(vid+1)]+=normal2[0];
           normalArray[3*(vid+1)+1]+=normal2[1];
           normalArray[3*(vid+1)+2]+=normal2[2];
           normalArray[3*(vid+1+n+1)]+=normal2[0];
           normalArray[3*(vid+1+n+1)+1]+=normal2[1];
           normalArray[3*(vid+1+n+1)+2]+=normal2[2];
           normalArray[3*(vid+n+1)]+=normal2[0];
           normalArray[3*(vid+n+1)+1]+=normal2[1];
           normalArray[3*(vid+n+1)+2]+=normal2[2];
           
           numT+=2;
       }

    // Normalize the normals stored in normalArray
    for(var i=0;i<normalArray.length-2;i+=3)
    {

        var vertex1=vec3.create();
        var vertex2=vec3.create();
        var vertex3=vec3.create();

        vec3.set(vertex1,normalArray[i],normalArray[i+1],vertexArray[i+2]); 
        vec3.normalize(vertex1, vertex1); 
        normalArray[i] = vertex1[0]; 
        normalArray[i+1] = vertex1[1]; 
        normalArray[i+2] = vertex1[2];
    }

    // Set heights
    for(var i=2;i<vertexArray.length;i+=3)
    {
        heightArray.push(vertexArray[i])
    }

    // // Set color of each vertex to be values of its normal
    // // For normal checking
    // for(var i=0;i<vertexArray.length;i+=3)
    // {
    //     colorArray.push(Math.abs(normalArray[i])); 
    //     colorArray.push(Math.abs(normalArray[i+1])); 
    //     colorArray.push(Math.abs(normalArray[i+2])); 
    //     colorArray.push(1.0); 
    // }

    return numT;
}
/**
 * Generates line values from faces in faceArray
 * @param {Array} faceArray array of faces for triangles
 * @param {Array} lineArray array of normals for triangles, storage location after generation
 */
function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
    numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(faceArray[fid]);
        lineArray.push(faceArray[fid+1]);
        
        lineArray.push(faceArray[fid+1]);
        lineArray.push(faceArray[fid+2]);
        
        lineArray.push(faceArray[fid+2]);
        lineArray.push(faceArray[fid]);
    }
}
/**
 * Dianmond step for diamond-square algorithm
 * @param {Array} x-y plane mesh array of vertices
 * @param {number} stride of each step calculation
 * @param {number} length of side of the x-y plane (a 2D array)
 * @param {number} how much the random height addition gets shrunk
 */
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
/**
 * Square step for diamond-square algorithm
 * @param {Array} x-y plane mesh array of vertices
 * @param {number} stride of each step calculation
 * @param {number} length of side of the x-y plane (a 2D array)
 * @param {number} how much the random height addition gets shrunk
 */
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
/**
 * Iteratively call diamond and square steps of diamond-square algorithm, to generate altitude of terrain
 * @param {Array} x-y plane mesh array of vertices
 * @param {number} length of side of the x-y plane (a 2D array)
 * @param {number} how much the random height addition gets shrunk
 */
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
/**
 * Cacluate the normal of a face
 * @param {vector} xyz coordinates of a vertex
 * @param {vector} xyz coordinates of a vertex
 * @param {vector} xyz coordinates of a vertex
 */
function getNormal(vertex1, vertex2, vertex3)
{
    var vector1 = vec3.create(); 
    var vector2 = vec3.create(); 
    var temp = vec3.create(); 
    var normal = vec3.create();

    vec3.subtract(vector1, vertex2, vertex1); 
    vec3.subtract(vector2, vertex3, vertex1); 
    vec3.cross(normal, vector1, vector2); 
    vec3.normalize(normal, normal); 
    // vec3.scale(normal, normal, -1.0); 

    return normal; 
}

