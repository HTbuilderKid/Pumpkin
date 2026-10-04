// import java.util.*;
/*
 * Follow the current question/starter code before these examples.
 * The two questions have INDEPENDENT permissions:
 *   BUILT-IN: Java collection/utility classes are allowed when the question permits.
 *   MANUAL: code the assessed structure/algorithm yourself, as in our labs. Do not
 *           quietly substitute LinkedList, ArrayList, Stack, Queue, Arrays.sort,
 *           Collections.sort, Streams, etc. for what must be implemented manually.
 * Scanner, basic I/O and primitive arrays are okay unless restricted by the question.
 * If the task asks for recursion, actually use recursion; if it bans recursion, don't.
 * Keep solutions compact: beginner Java, if/else, loops, basic classes, simple methods.
 * Use the starter's names/fields/output format. One public top-level class per file.
 * Do not introduce unnecessary helpers, advanced generics, libraries or frameworks.
 *
 * TOP-OF-QUESTION COMMENT (type ONE of these in the file you are completing):
 * // MODE: BUILT-IN. Follow Q2.java conventions. Use permitted Java APIs.
 * // MODE: MANUAL. Follow Q2.java. Implement structures/algorithms ourselves.
 * // TASK: [paste the exact question, constraints, and desired method signatures here].
 * Comments close to the cursor matter most for automatic inline suggestions.
 *
 * COURSE TOPICS: Big-O; selection/insertion sort; searching; singly linked lists;
 * array stack (LIFO); array/circular queue (FIFO); tree/BST recursion and deletion;
 * lambdas, Comparator and Person records; Java Stream pipelines when allowed.
 * BST insert: duplicates go LEFT (data <= node.data), unless task says otherwise.
 * BST traversals: inorder L-root-R; preorder root-L-R; postorder L-R-root.
 * BST recursion: reassign changed links/root. Never use local node=null as deletion.
 * BST delete: handle 0, 1, 2 children; preserve both surviving subtrees.
 * k-th smallest: count inorder positions; duplicates count as separate nodes.
 * Range [low,high] deletion: inclusive; leverage BST ordering to skip safe branches.
 * Mirror in-place: recursively swap each node's left and right references.
 * Check empty tree, duplicates, root changes, invalid k, and empty/full structures.
 * Arrays/manual sort: use class-taught selection/insertion sort, not Arrays.sort.
 * Streams-only exercises: do not replace the pipeline with for/while loops.

public class Q2 {
    // MANUAL SINGLY LINKED LIST: own Node/head, not java.util.LinkedList.
    static class ListNode { int data; ListNode next; ListNode(int x) { data = x; } }
    static class ManualList {
        ListNode head;
        void add(int x) {
            ListNode n = new ListNode(x);
            if (head == null) { head = n; return; }
            ListNode temp = head;
            while (temp.next != null) temp = temp.next;
            temp.next = n;
        }
        void show() {
            for (ListNode temp = head; temp != null; temp = temp.next)
                System.out.print(temp.data + " ");
        }
        // For deletion: handle empty list, head removal, and previous.next links.
    }
    // MANUAL ARRAY STACK: top=-1, push/pop/peek, overflow and underflow checks.
    static class ManualStack {
        int[] a = new int[20]; int top = -1;
        boolean push(int x) { if (top == a.length - 1) return false; a[++top] = x; return true; }
        Integer pop() { return top == -1 ? null : a[top--]; }
        Integer peek() { return top == -1 ? null : a[top]; }
    }
    // MANUAL CIRCULAR ARRAY QUEUE: front, rear and size; FIFO via modulo.
    static class ManualQueue {
        int[] a = new int[20]; int front = 0, rear = 0, size = 0;
        boolean enqueue(int x) {
            if (size == a.length) return false;
            a[rear] = x; rear = (rear + 1) % a.length; size++; return true;
        }
        Integer dequeue() {
            if (size == 0) return null;
            int x = a[front]; front = (front + 1) % a.length; size--; return x;
        }
    }
    // MANUAL BST: a node is not a java.util collection. Return updated subtree.
    static class TreeNode { int data; TreeNode left, right; TreeNode(int x) { data = x; } }
    static TreeNode insert(TreeNode n, int x) {
        if (n == null) return new TreeNode(x);
        if (x <= n.data) n.left = insert(n.left, x);
        else n.right = insert(n.right, x);
        return n;
    }
    static void inorder(TreeNode n) {
        if (n == null) return;
        inorder(n.left); System.out.print(n.data + " "); inorder(n.right);
    }
    static TreeNode deleteOne(TreeNode n, int x) {
        if (n == null) return null;
        if (x < n.data) n.left = deleteOne(n.left, x);
        else if (x > n.data) n.right = deleteOne(n.right, x);
        else {
            if (n.left == null) return n.right;
            if (n.right == null) return n.left;
            TreeNode temp = n.left;                // predecessor: maximum of left subtree
            while (temp.right != null) temp = temp.right;
            n.data = temp.data;
            n.left = deleteOne(n.left, temp.data);
        }
        return n; // caller must do root=deleteOne(root,x) or n.left=...
    }
    static void mirror(TreeNode n) {
        if (n == null) return;
        TreeNode temp = n.left; n.left = n.right; n.right = temp;
        mirror(n.left); mirror(n.right);
    }
    // MANUAL SORT EXAMPLE: selection sort; use insertion sort if question says so.
    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j;
            int temp = a[i]; a[i] = a[min]; a[min] = temp;
        }
    }

    // BUILT-IN EXAMPLE: okay ONLY for the built-in-permitted question.
    static class Person {
        private String name; private int age;
        Person(String name, int age) { this.name = name; this.age = age; }
        String getName() { return name; }
        int getAge() { return age; }
        public String toString() { return name + " - Age: " + age; }
    }
    static void builtInExample() {
        LinkedList<Person> people = new LinkedList<>();
        people.add(new Person("Daksh", 19));
        people.add(new Person("Daniel", 28));
        people.sort(Comparator.comparingInt(Person::getAge));          // Comparator
        people.sort((a, b) -> a.getName().compareTo(b.getName()));     // lambda
        people.forEach(System.out::println);                          // method reference
        // Streams only when asked/allowed: people.stream().filter(p -> p.getAge() > 20).map(Person::getName).forEach(System.out::println);
    }
} */
