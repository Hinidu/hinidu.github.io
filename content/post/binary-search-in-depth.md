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

## Generalize linear search

Let's start our generalization lesson from the simpler example --- *linear 
search*. Why do we constrain ourselves by hardcoding the desired property of an 
element? Nothing can stop us to search for an element with any property that we 
want (let's call this property 
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

The code has became even simpler when we've forgot about all these cumbersome 
keys and comparisons.

That's how we can implement specific algorithm for searching by key using our 
new generalized version:

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
probably you use it all the time --- almost any language has something like 
this in its standard library (`elements.First(predicate)` in `C#`, 
`next(ifilter(predicate, elements), None)` in `python` and `find predicate xs` 
in `Haskell`).
