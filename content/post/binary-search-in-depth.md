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

#### The new challenge

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

#### The conclusion

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

The major difference with *linear search* here is that we've modified our 
predicate: we check that `a[m] >= k` instead of `a[m] = k`. And we check the 
strict equality only when we already found the first item in the sequence that 
is greater or equal than the specified key.
