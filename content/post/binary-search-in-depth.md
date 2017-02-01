+++
date = "2017-01-19T21:15:38+02:00"
title = "Binary Search in Depth"
tags = ["algorithms"]
highlight = true
tabs = true
draft = true
+++

This is the second post about *binary search* algorithm. I suggest you to read 
[the first one]({{< relref "designing-binary-search.md" >}}) if you didn't do 
it yet. In this post we'll generalize *binary search* to be able to find more 
than just an element by its key.

Let's start our generalization lesson from the simpler example --- *linear 
search*.

## Generalize linear search

#### What we had before?

I will put here the original version from [the previous post]({{< relref 
"designing-binary-search.md" >}}) for reference:

{{% tabs %}}
  {{< tab "C#" >}}
```csharp
TElement LinearSearch<TElement, TKey>(
  IEnumerable<TElement> elements, Func<TElement, TKey> getKey, TKey key)
  where TKey : IEquatable<TKey>
{
  foreach (var element in elements)
    if (getKey(element).Equals(key))
      return element;
  return default(TElement);
}
```
  {{< /tab >}}

  {{< tab "Python" >}}
```python
def linear_search(elements, get_key, key):
  for element in elements:
    if get_key(element) == key:
      return element
  return None
```
  {{< /tab >}}

  {{< tab "Haskell" >}}
```haskell
-- The simple version with explicit recursion for lists.
linearSearch :: Eq k => (a -> k) -> [a] -> k -> Maybe a
linearSearch getKey (x:xs) k | getKey x == k = Just x
linearSearch getKey (_:xs) k                 = linearSearch getKey xs k
linearSearch _      []     _                 = Nothing

-- The generalized version with Monoid and Alternative magic for any Foldable 
-- data structure.
linearSearch' :: (Foldable t, Eq k) => (a -> k) -> k -> t a -> Maybe a
linearSearch' getKey key =
  getAlt . foldMap (λx -> Alt $ if getKey x == key then Just x else Nothing)
```
  {{< /tab >}}
{{% /tabs %}}

#### New challenge

But why do we constrain ourselves by hardcoding the desired property of an 
element (the property of having some specific key)? Nothing can stop us from 
searching for an element with any property that we want (let's call this 
property 
[predicate](https://en.wikipedia.org/wiki/Predicate_(mathematical_logic))):

{{% tabs %}}
  {{< tab "C#" >}}
```csharp
TElement LinearSearch<TElement>(
  IEnumerable<TElement> elements, Func<TElement, bool> predicate)
{
  foreach (var element in elements)
    if (predicate(element))
      return element;
  return default(TElement);
}
```
  {{< /tab >}}

  {{< tab "Python" >}}
```python
def linear_search(elements, predicate):
  for element in elements:
    if predicate(element):
      return element
  return None
```
  {{< /tab >}}

  {{< tab "Haskell" >}}
```haskell
-- The simple version with explicit recursion for lists.
linearSearch :: (a -> Bool) -> [a] -> Maybe a
linearSearch predicate (x:_)  | predicate x = Just x
linearSearch predicate (_:xs)               = linearSearch predicate xs
linearSearch _         []                   = Nothing

-- The generalized version with Monoid and Alternative magic for any Foldable 
-- data structure.
linearSearch' :: Foldable t => (a -> Bool) -> t a -> Maybe a
linearSearch' predicate =
  getAlt . foldMap (λx -> Alt $ if predicate x then Just x else Nothing)
```
  {{< /tab >}}
{{% /tabs %}}

#### Conclusion

The code has became even simpler when we've forgot about all these cumbersome 
keys and comparisons.

That's how we can implement specific algorithm for searching by a key using the 
generalized version of the algorithm:

{{% tabs %}}
  {{< tab "C#" >}}
```csharp
LinearSearch(elements, x => getKey(x) == key);
```
  {{< /tab >}}

  {{< tab "Python" >}}
```python
linear_search(elements, lambda x: get_key(x) == key)
```
  {{< /tab >}}

  {{< tab "Haskell" >}}
```haskell
linearSearch (λx -> getKey x == key) xs
```
  {{< /tab >}}
{{% /tabs %}}

I'm sure you can imagine many more use cases for generalized algorithm and most 
probably you use it almost every day --- almost any language has something like 
this in its standard library (`elements.First(predicate)` in `C#`, 
`next(ifilter(predicate, elements), None)` in `python` and `find predicate xs` 
in `Haskell`).

Yeah, it was not very impressive. But I hope it will help us later with *binary 
search*.

## Generalize binary search

#### What we had before?

Again I will put here the original version in pseudocode from [the previous 
post]({{< relref "designing-binary-search.md" >}}) for reference:

```
function binary_search(a, n, k)
  l = -1
  r = n

  while r - l > 1
    m = (l + r) / 2
    if a[m] >= k
      r = m
    else
      l = m

  if r < n and a[r] = k
    return r
  else
    return nil
```

The major difference compared to *linear search* is that we've modified the 
required predicate: we check that `a[m] >= k` instead of `a[m] = k`. And we 
check the strict equality only when we already found the first item in the 
sequence that is greater than or equal to the specified key.

#### Mind expansion

Let's forget about original predicate for a moment --- if we omit the strict 
comparison at the end of the algorithm then `r` is the index of the **first** 
(and the **smallest** too because the array is sorted) element in the array 
that is `>= k` (or `r = n` if there is no such element).

Now we can ask ourselves the same question as we did before with *linear 
search*: what's special in `a[m] >= k` predicate? Can we ask other questions 
using the same algorithm? Of hat the specified predicate should be `false` for 
zero or more initial values of the array and it should be `true` for all values 
after the falsy ones til the end of the array.

For example we can have these sequences of predicate results for 
"binary-searchable" array:

```
false false false true true true true
true true
false
```

But not these:

```
false true false true false true true
false true false
true true false
```

I don't want you to believe me --- if it's not obvious to you why *binary 
search* impose this requirement on the data think about it more because the 
understanding of this fact is very important for the proper usage of binary 
search in practice. For example you can execute *binary search* by hand with 
bad inputs and see why it is possible to get a wrong answer.

#### Implementation

This is the pseudocode with `a[m] >= k` replaced by predicate `p`. And of 
course there are updated implementations in real world programming languages:

{{% tabs %}}
  {{< tab "Pseudo" >}}
```
function binary_search(p, a, n)
  l = -1
  r = n

  while r - l > 1
    m = (l + r) / 2
    if p(a[m])
      r = m
    else
      l = m

  if r < n
    return r
  else
    return nil
```
  {{< /tab >}}

  {{< tab "C#" >}}
```csharp
int? BinarySearch<TElement>(TElement[] elements, Func<TElement, bool> predicate)
{
  int l = -1, r = elements.Length;

  while (r - l > 1)
  {
    int m = (r + l) / 2;
    if (predicate(elements[m]))
      r = m;
    else
      l = m;
  }

  return r < elements.Length ? r : null;
}
```
  {{< /tab >}}

  {{< tab "Python" >}}
```python
def binary_search(elements, predicate):
  l = -1
  r = len(elements)

  while r - l > 1:
    m = (r + l) / 2
    if predicate(elements[m]):
      r = m
    else:
      l = m

  if r < len(elements):
    return r
  else:
    return None
```
  {{< /tab >}}

  {{< tab "Haskell" >}}
```haskell
binarySearch :: (IArray a e, Ix i, Integral i) =>
  (a -> Bool) -> a i e -> Maybe i
binarySearch predicate arr =
  let (l, r) = bounds arr
  in  loop (l - 1) (r + 1)
  where
    loop l r | r - l > 1 =
      let m = (l + r) `div` 2
      in  if predicate (arr ! m)
            then loop l m
            else loop m r

    loop _ r | bounds arr `inRange` r = Just r
             | otherwise = Nothing
```
  {{< /tab >}}
{{% /tabs %}}

The code became simpler again (just like the code of *linear search* above) 
because we forget about insignificant details of specific predicate and write 
only the core logic of the algorithm.

#### Next step?

Is it really everything we can squeeze out of *binary search*? Can we make it 
even more general? Of course yes!

How we use the array in the algorithm? We just check a predicate on a handful 
of its elements. What if we don't have an array but the function `f` to compute 
them based on their indexes? It would be an awful waste to compute that array 
only to run binary search on it. So we can replace hardcoded array by the 
function that computes the elements of imaginary array by index.

Also we should add the left boundary of the search space `left` to the argument 
list because now we don't have an array that always start from 0 (though 
Haskell arrays can have arbitrary boundaries and we already process them 
correctly). Note that I've renamed `n` to `right` to match the style of the new 
`left` argument. In memory of the forgotten array `a` let's assume that user 
will provide the search range as a half-open interval `[left, right)`.

{{% tabs %}}
  {{< tab "Pseudo" >}}
```
function binary_search(p, f, left, right)
  l = left - 1
  r = right

  while r - l > 1
    m = (l + r) / 2
    if p(f(m))
      r = m
    else
      l = m

  if r < right
    return r
  else
    return nil
```
  {{< / tab >}}

  {{< tab "C#" >}}
```csharp
int? BinarySearch<TElement>(
  Func<TElement, bool> predicate, Func<int, TElement> f, int left, int right)
{
  int l = left - 1, r = right;

  while (r - l > 1)
  {
    int m = (r + l) / 2;
    if (predicate(f(m)))
      r = m;
    else
      l = m;
  }

  return r < right ? r : null;
}
```
  {{< /tab >}}

  {{< tab "Python" >}}
```python
def binary_search(predicate, f, left, right):
  l = left - 1
  r = right

  while r - l > 1:
    m = (r + l) / 2
    if predicate(f(m)):
      r = m
    else:
      l = m

  if r < right:
    return r
  else:
    return None
```
  {{< /tab >}}

  {{< tab "Haskell" >}}
```haskell
binarySearch :: Integral i => (i -> a) -> (i, i) -> (a -> Bool) -> Maybe i
binarySearch f (left, right) predicate = loop (left - 1) right
  where
    loop l r | r - l > 1 =
      let m = (l + r) `div` 2
      in  if predicate (f m)
            then loop l m
            else loop m r

    loop _ r | r < right = Just r
             | otherwise = Nothing
```
  {{< /tab >}}
{{% /tabs %}}

#### Is it enough?

Whew! We did a long path from *linear search* to this very generic version of 
*binary search*. Do we still have some restrictions that we can break? 
I encourage you to think about it a little bit yourself. Read the rest only 
when you done it.

#### One last step

The last thing that we'll mitigate is the type of elements in algorithm search 
space --- there are a plenty of problems out there which can be solved using 
*binary search* but these problems are expressed using the function with real 
number argument instead of an integer argument from the previous section.

Let's see how we should change the current implementation to work with real 
numbers. Fortunately there is only one thing to change --- `while r - l > 1`. 
Of course in the real numbers setting we want more accurate answer (if we don't 
then why are we switching to real numbers in the first place?). Unfortunately 
the way we should change it is quite tricky...

##### ε-approach

One thing that can come to your mind is that if we want better accuracy then we 
can specify how much accuracy we want exactly. For example we could decide that 
10<sup>-6</sup> is enough for us so we'll just write `while r - l > 1e-6`. But 
this approach can work or can not work --- it depends on your specific task.

Why this approach can work is pretty obvious but why it can not work?  The 
floating point number representation in computers is guilty.  The problem is 
that standard floating point types have limited precision because there are 
only 4, 8 or 16 bytes to represent the whole universe of real numbers. So the 
real numbers in computer are countable. It means that we are in very strange 
situation from the mathematical point of view --- in math between any pair of 
real numbers exists another real number but this is not the case for floating 
point arithmetic in computers. So we can say that every floating point number 
have the "next" one. And the difference between the number and its next number 
can be much more than our ε --- 10<sup>-6</sup> (for example 10<sup>100</sup> 
and it's "next" number will sure have bigger difference). I don't want to 
describe representation of floating point numbers too deep so if you didn't 
understand this paragraph please read about [IEEE floating 
point](https://en.wikipedia.org/wiki/IEEE_floating_point).

The conclusion is that if we want to use the ε-approach we should take into 
consideration possible result values and select actual value for ε accordingly. 
So this approach is quite error-prone and I don't recommend to use it unless 
you fully understand what you're doing --- because if you made a mistake you'll 
get an endless loop with some inputs.

By the way this approach would work without endless loop problem for fixed 
point arithmetic but floating point is much more common so I don't describe it 
in detail (though the world could be so much better place if fixed point 
arithmetic was more widespread but this world is cruel and full of suffering).

This approach is not ideal, let's try to find something else.

##### Limited iterations approach

Maybe you already have a fix for ε-approach in your mind! How we can solve 
endless-loop problem in general way? Let's just limit the possible number of 
iterations!

Actually we can go even further and if we are too lazy to calculate the 
required ε we can replace `while r - l > ε` by `for iter from 1 to iter_count`.

Now the only tricky question is that how many iteration you want to perform --- 
you should find the balance between accuracy of the answer and performance.

This approach is quite hacky, isn't it? Can we be smarter?

##### Absolute computational accuracy

The answer is hiding again in floating point representation and the fact that 
every floating point number have "neighbors" (the next number and the previous 
one). Sooner or later `l` and `r` will become these neighbors and in that case 
`(l + r) / 2` will be equal to `l` or `r` and it will be not possible to find 
more accurate answer to our problem with used floating point type.

## Advanced usages

So now we are enlightened on the real essence of *binary search*. But what we 
can do with that? Let's consider some examples.
