# Instructions
- vars
    ```
    ---icX
       var a = 10
    ---ic10
       move r0 10
    ```
    ```
    ---icX
       use aliases
       var a = 10
    ---ic10
       alias a r0
       move a 10
    ```
- increment
    ```
    ---icX
       var a = 0
       a++
    ---ic10
       move r0 0
       add r0 r0 1
    ```
- math

  ```
  ---icX
     var x =  5 + 5 * 2 
  ---ic10
     move r0 15
  ```
  ```
  ---icX
     var k = 2
     var y = 5
     var x =  y + y * k
  ---ic10
     move r0 2
     move r1 5
     mul r15 r1 r0
     add r2 r1 r15
     add r2 r2 5
  ```
  
  ```
  ---icX
     const x = 2 + 2
     const y = x + 2
     var z = y + 2
  ---ic10
     move r0 8
  ```

- if,else
    ```
    ---icX
       var a = 0
       var b = 0
       if a >= 0
       b = 1
       else
       b = 0
       end
    ---ic10
       move r0 0
       move r1 0
       sgez r15 r0
       beqz r15 if0else
       beq r15 1 if0
       if0:
       move r1 1
       j if0exit
       if0else:
       move r1 0
       if0exit:
    ```
  
- while
    ```
    ---icX
       var a = 0
       while a >= 10
           a++
       end
    ---ic10
       move r0 0
       while0:
           sge r15 r0 10
           beqz r15 while0exit
           add r0 r0 1
       j while0
       while0exit:
    ```
- Devices
    ```
    ---icX
       d0.Setting = 1
       var a = d0.Setting
       var b = d0.slot(a).PrefabHash
       a = d(5438547545).Setting(sum)
       d(5438547545).Setting = b
    ---ic10
       s d0 Setting 1
       l r0 d0 Setting
       ls r1 d0 r0 PrefabHash
       lb r0 5438547545 Setting Sum
    ```

- function
    ```
    ---icX
       var a = 10
       fuctionName()
       function fuctionName
           d0.Setting = a
       end
    ---ic10
       move r0 10
       jal fuctionName
       j _icXstart
       fuctionName:
           s d0 Setting r0
       j ra
       _icXstart:
    ```
