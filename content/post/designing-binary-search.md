+++
date = "2017-01-01T17:30:14+02:00"
title = "Designing Binary Search"
highlight = true
tags = ["algorithms"]
draft = true
+++

I would like to write about some useful algorithms which I have encountered in 
my day to day job. I think that the most efficient and beneficial way of 
learning algorithms is going through their design process step by step --- this 
way you'll get the solid understanding of how it works and most importantly the 
skills to design algorithms yourself. I want to start from the most basic but 
still powerful algorithm --- *binary search*.  At first I will describe this 
algorithm, then we will discuss it's implementation tips and tricks, and in the 
next post I will show you some extensions and advanced usages of this algorithm 
(even the one you can use to find bugs in your programs).

## Motivation

#### Problem statement

Let's talk about the most common usage of *binary search* algorithm using 
example from my current job. Our custom editor for MMORPG has many lists of 
entities: mobs, items, quests, etc. Often we need to search for some entity by 
some key (in our case it's almost always entity ID). Most other applications 
need to solve similar tasks.

#### Naive solution

The first solution that can come to mind is to look at each element in the 
corresponding list comparing each element's key with the needed one:

```csharp
T LinearSearch<TElement, TKey>(
  IEnumerable<TElement> elements, Func<TElement, TKey> getKey, TKey key)
  where TKey : IEquatable<TKey>
{
  foreach (var element in elements)
    if (getKey(element).Equals(key))
      return element;
  return default(TElement);
}
```

```python
def linear_search(elements, get_key, key):
  for element in elements:
    if get_key(element) == key:
      return element
  return None
```

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

Actually it's a viable approach --- it's dead simple, it works for any 
traversable structure (arrays, linked lists, trees, graphs, etc) and it is 
quite performant when there are only small number of elements. This algorithm 
has its own name --- *linear search*. As name suggests it's execution time 
depends on the number of elements **linearly** in the worst case --- as you add 
items to the list the execution time of this algorithm is growing 
proportionally to the number of added items. Mathematically speaking *linear 
search* has [time complexity](https://en.wikipedia.org/wiki/Time_complexity) 
`O(n)`.

But we're expecting quite big number of entities --- long-live MMORPG can have 
thousands or even tens of thousands of quests, NPCs and items. And we need to 
look for them in editor quite often because these entities are very 
interconnected --- a quest can reference many other entities in the game world.  
If we'll scan the entire list to find the entity with required ID our users 
(gamedesigners, artists and scriptwriters) will be very displeased by the 
editor responsiveness and speed. Let's think what we can do with it?

## Algorithm design

#### Insight

It's quite obvious that we can't solve this problem faster if we don't imply 
some additional restrictions on the data --- required element can be anywhere 
so in the worst case we should look at every element in the data structure.

Let's try to remember good examples of solving "search by key" problem in the 
real world. Some time ago people have actively used dictionaries and phonebooks 
(now we successfully delegate these boring tasks to computers) and it would be 
a real nightmare to search a word or a name in them if they were not sorted. 
Maybe it's still a good idea to sort the set to simplify the search?

#### Formalization

How exactly people used to optimize their search process in dictionaries and 
phonebooks? Let's analyze their behavior:

1. Choose some page.
2. Check the content of the current page.
3. If the current page contains the required word then the work is done!
4. But if it's not the case the person now have more useful information than it 
   had before --- by comparing the words on the current page and required word 
   we can determine whether the required word is on a page with a number less 
   than the current page's number or it is on a page with a higher number.
5. If the current page is the last candidate and we already know that no other 
   page can contain the required word then the search is completed though 
   unsuccessfully.
6. Perform the same steps again but considering only the part of dictionary 
   which can contain the required word.

This way a person can significantly reduce the size of search set on each 
iteration and avoid looking at each element of this set.

But what's the best way to choose the next page? If we will choose the first 
remaining page at each iteration we will get exactly the *linear search* 
algorithm discussed above. At each iteration we want to exclude as many 
elements as we can from our search set. By choosing some element for comparison 
we split the search set into two parts --- the left part before choosen element 
and the right one after it. But we don't know which part will be excluded after 
comparison so we should be prepared to each outcome and we can't make 
a preference to one of them. If we make one part significantly bigger than 
another and if we're not lucky then this bigger part remains. To avoid this 
suboptimal situation we should make these parts' sizes as equal as possible.

#### Implementation

Let's try to implement this algorithm step by step in pseudocode:

* For simplicity (without loss of generality) let's take the array of integers 
  `a` with length `n` (first index is `0`).  In this array we'll search for 
  integer `k`.  Let's define the search range as half-open interval `(l, r]` 
  (`l` is excluded, `r` is included). To simplify the edge cases when `k` is 
  less or greater than every element from `a` we add two imaginary elements: 
  `a[-1] = -∞` and `a[n] = +∞`. They allow to use `(-1, n]` as initial 
  boundaries and fulfill the invariant that `a[l] < k` and `a[r] >= k`. This 
  invariant will be useful in a proof of algorithm correctness.

```
function binary_search(a, n, k)
  l = -1
  r = n
```

* Now let's describe one step of searching. Take an item in the middle of the 
  current search range and compare it with `k`. There are three possible cases: 
  selected element is less, equal or greater than `k`. But we'll combine two of 
  them to simplify our code. After comparison we should update search 
  boundaries accordingly.

```
m = (l + r) / 2
if a[m] >= k
  r = m
else
  l = m
```

* As you can see we maintain our invariant `a[l] < k` and `a[r] >= k`. So now 
  we should wrap this step in a loop. But when it should stop? `l` and `r` 
  become closer to each other and the size of search set becomes smaller after 
  each step.  Actually we should find the first element that is `>= k`. So we 
  should stop when the search set contains no more than `1` element (an edge 
  case with `n = 0` will work as well).

```
while r - l > 1
  m = (l + r) / 2
  if a[m] >= k
    r = m
  else
    l = m
```

* Thoughtful reader could note that in the loop we're accessing `a[m]` but 
  there could be a problem if we try to access `a[-1]` or `a[n]` because they 
  exist only in our imagination. But we never access them --- if `r - l > 1` 
  then `m != l` and `m != r` (there is always at least one integer number 
  between the two non-consecutive integer numbers).

* We need just one step more to finish our algorithm. We've got `(l, r]` search 
  boundaries where `l + 1 = r`. Because we've maintained the invariant that 
  `a[l] < k` and `a[r] >= k`. So `a[r]` is the smallest element of `a` that is 
  `>= k`. We just need to check whether it is a real element (not an imaginary 
  `a[n] = +∞`) and whether it is `= k` or not.

```
if r < n and a[r] = k
  return r
else
  return nil
```

That's the whole algorithm in pseudocode:

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

Let's see it's implementations with all bells and whistles of real world 
programming languages:

```csharp
T BinarySearch<TElement, TKey>(
  TElement[] elements, Func<TElement, TKey> getKey, TKey key)
  where TKey : IComparable<TKey>
{
  int l = -1, r = elements.Length;

  while (r - l > 1)
  {
    int m = (r + l) / 2;
    if (getKey(elements[m]).CompareTo(key) >= 0)
      r = m;
    else
      l = m;
  }

  return r < elements.Length && getKey(elements[r]).CompareTo(key) == 0
    ? elements[r]
    : default(TElement);
}
```

```python
def binary_search(elements, get_key, key):
  l = -1
  r = len(elements)
  while r - l > 1:
    m = (r + l) / 2
    if get_key(elements[m]) >= key:
      r = m
    else:
      l = m
  if r < len(elements) and get_key(elements[r]) == key:
    return elements[r]
  else:
    return None
```

```haskell
binarySearch :: (IArray a e, Ix i, Integral i, Ord k) =>
  (a -> k) -> a i e -> k -> Maybe i
binarySearch getKey arr key =
  let (l, r) = bounds arr
  in  loop (l - 1) (r + 1)
  where
    loop l r | r - l > 1 =
      let m = (l + r) `div` 2
      in  if getKey (arr ! m) >= key
            then loop l m
            else loop m r

    loop _ r | bounds arr `inRange` r && getKey (arr ! r) == key = Just r
             | otherwise = Nothing
```

## Algorithm analysis

#### Correctness

The most important part of correctness proof is the invariant that `a[l] < k` 
and `a[r] >= k`. This invariant itself is pretty obvious to prove (it is true 
before the loop, it is maintained on each iteration and it holds after the end 
of the loop). You can try to prove it yourself to practice your formal 
reasoning skills ;-) The small number of edge cases were described above as 
well.

#### Performance

Performance of *binary search* can be measured by the amount of item lookups 
and comparisons which the algorithm will do for an array of length `n`. All 
other operations are primitive and doesn't add anything to the algorithm's 
[time complexity](https://en.wikipedia.org/wiki/Time_complexity).

The number of lookups can be found using this recurrence relation:

```
T(0) = 0
T(n) = 1 + T(⌈n/2⌉)
```

The solution for this equation is `T(n) = O(log(n))`. We divide `n` by `2` 
until `n` becomes `1`. We should repeat division `log(n)` times to achieve this 
goal.

So the time complexity of *binary search* is
`O((LookupTime(n) + ComparisonTime) * log(n))`.
In the case of integer array both `LookupTime(n)` and `ComparisonTime` are 
`O(1)` (constant) so in that case time complexity will be just `O(log(n))` 
which is significantly better than `O(n)` of *linear search*. You can think 
about other data structures and key types --- what time complexity you'll get 
with them?

Of course nothing comes for free --- we've constrained ourselves to sorted 
arrays in opposite to the freedom of *linear search*. Perhaps we'll need to 
sort the array before executing the *binary search* or even maintain the order 
of elements after additions, updates and deletions. So you should analyze 
performance of your program in complex --- if you sort an array for only 
**one** execution of *binary search* it's just a waste of time because *sort* 
+ *binary search* can't be faster than *linear search*. And if you need add,
update or delete elements frequently then [*binary search 
tree*](https://en.wikipedia.org/wiki/Binary_search_tree) or [*hash 
table*](https://en.wikipedia.org/wiki/Hash_table) would be a better fit.

#### Comparison with more widespread implementations

Perhaps you saw different implementations of *binary search*. This one has 
following peculiarities:

- Fewer cases --- `a[m] < key` and `a[m] >= key` instead of classic `a[m] 
  < key`, `a[m] > key` and `a[m] = key`.
- Imaginary `a[-1]` and `a[n]` elements.
- Half-open interval `(l, r]` instead of closed interval `[l, r]`.

All of it whill simplify the generalization of algorithm in the next post.

## To Be Continued

Thank you for reading! I hope it was useful and interesting for you. In the 
next post I'll describe more use cases and generalize *binary search* to solve 
broader set of problems than just searching for element in array.

If you have any questions or suggestions feel free to leave a comment --- 
I really appreciate any feedback.
